const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const CloudinaryService = require('../services/cloudinary.service');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación y autorización
const requireAuth = (req, res, next) => {
  req.user = { id: 1, username: 'Admin', role: 'admin' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de super administrador'
    });
  }
  next();
};

// GET /api/admin/dashboard - Dashboard principal
router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalMangas,
      totalChapters,
      totalComments,
      totalReviews,
      recentUsers,
      recentMangas,
      topMangas,
      systemStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.comment.count(),
      prisma.review.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          isVerified: true,
          level: true
        }
      }),
      prisma.manga.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          author: true,
          createdAt: true,
          status: true,
          rating: true
        }
      }),
      prisma.manga.findMany({
        orderBy: { views: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          views: true,
          favoriteCount: true,
          rating: true
        }
      }),
      getSystemStats()
    ]);

    // Estadísticas de crecimiento (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, newMangas, newComments] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.manga.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ]);

    const dashboardData = {
      stats: {
        totalUsers,
        totalMangas,
        totalChapters,
        totalComments,
        totalReviews,
        growth: {
          newUsers,
          newMangas,
          newComments
        }
      },
      recent: {
        users: recentUsers,
        mangas: recentMangas
      },
      topContent: {
        mangas: topMangas
      },
      system: systemStats
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/users - Gestión de usuarios
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || ''; // active, inactive, banned
    const sort = req.query.sort || 'recent';
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(status === 'banned' && { isBanned: true })
    };

    // Configurar ordenamiento
    let orderBy = {};
    switch (sort) {
      case 'username':
        orderBy = { username: 'asc' };
        break;
      case 'email':
        orderBy = { email: 'asc' };
        break;
      case 'level':
        orderBy = { level: 'desc' };
        break;
      default: // recent
        orderBy = { createdAt: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          level: true,
          experience: true,
          isActive: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          lastActiveAt: true,
          _count: {
            select: {
              favorites: true,
              comments: true,
              reviews: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/admin/users/:userId - Actualizar usuario
router.put('/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, isVerified, isBanned, banReason } = req.body;

    // Validar que no se pueda modificar super_admin (solo por otro super_admin)
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo un super administrador puede asignar rol de super_admin'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Prevenir que un admin se desactive a sí mismo
    if (parseInt(userId) === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isBanned !== undefined) {
      updateData.isBanned = isBanned;
      if (isBanned && banReason) {
        updateData.banReason = banReason;
        updateData.bannedAt = new Date();
        updateData.bannedBy = req.user.id;
      } else if (!isBanned) {
        updateData.banReason = null;
        updateData.bannedAt = null;
        updateData.bannedBy = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        isBanned: true,
        banReason: true
      }
    });

    // Log de la acción
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'USER_UPDATE',
        targetType: 'USER',
        targetId: parseInt(userId),
        details: updateData,
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/admin/users/:userId - Eliminar usuario
router.delete('/users/:userId', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // En lugar de eliminar, desactivar la cuenta
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}@mangaverse.com`,
        username: `deleted_user_${Date.now()}`,
        deletedAt: new Date(),
        deletedBy: req.user.id
      }
    });

    // Log de la acción
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'USER_DELETE',
        targetType: 'USER',
        targetId: parseInt(userId),
        details: { originalUsername: user.username, originalEmail: user.email },
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/mangas - Gestión de mangas
router.get('/mangas', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type = req.query.type || '';
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status }),
      ...(type && { type })
    };

    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          status: true,
          type: true,
          rating: true,
          views: true,
          favoriteCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              chapters: true,
              reviews: true,
              comments: true
            }
          }
        }
      }),
      prisma.manga.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        mangas,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching mangas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/reports - Gestión de reportes
router.get('/reports', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || ''; // comment, manga, user
    const status = req.query.status || 'pending'; // pending, resolved, dismissed
    const skip = (page - 1) * limit;

    // Obtener reportes de comentarios
    const commentReports = await prisma.commentReport.findMany({
      where: {
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' },
      skip: type === 'comment' ? skip : 0,
      take: type === 'comment' ? limit : (type ? 0 : Math.floor(limit / 3)),
      include: {
        comment: {
          include: {
            user: { select: { username: true } },
            manga: { select: { title: true } }
          }
        },
        reportedByUser: { select: { username: true } }
      }
    });

    // Obtener reportes de usuarios (si los hay)
    // const userReports = await prisma.userReport.findMany({...});

    const reports = [
      ...commentReports.map(report => ({
        id: report.id,
        type: 'comment',
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
        reportedBy: report.reportedByUser.username,
        target: {
          id: report.comment.id,
          content: report.comment.content,
          user: report.comment.user.username,
          manga: report.comment.manga?.title
        }
      }))
    ];

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: page,
          total: Math.ceil(reports.length / limit),
          limit,
          totalItems: reports.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/admin/reports/:reportId - Resolver reporte
router.put('/reports/:reportId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action, adminNotes } = req.body; // resolved, dismissed

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    // Actualizar reporte de comentario
    const updatedReport = await prisma.commentReport.update({
      where: { id: parseInt(reportId) },
      data: {
        status,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
        adminNotes,
        action
      }
    });

    // Si se resuelve como válido, tomar acción sobre el contenido
    if (status === 'resolved' && action) {
      const report = await prisma.commentReport.findUnique({
        where: { id: parseInt(reportId) },
        include: { comment: true }
      });

      if (action === 'delete_comment') {
        await prisma.comment.update({
          where: { id: report.commentId },
          data: { 
            content: '[Comentario eliminado por moderación]',
            isDeleted: true,
            deletedAt: new Date()
          }
        });
      } else if (action === 'ban_user') {
        await prisma.user.update({
          where: { id: report.comment.userId },
          data: {
            isBanned: true,
            banReason: 'Contenido inapropiado reportado',
            bannedAt: new Date(),
            bannedBy: req.user.id
          }
        });
      }
    }

    // Log de la acción
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'REPORT_RESOLVE',
        targetType: 'REPORT',
        targetId: parseInt(reportId),
        details: { status, action, adminNotes },
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      data: updatedReport,
      message: 'Reporte procesado exitosamente'
    });

  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/analytics - Analíticas del sitio
router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '30'; // días
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      userGrowth,
      contentGrowth,
      activityStats,
      popularContent,
      trafficStats
    ] = await Promise.all([
      getUserGrowthStats(startDate),
      getContentGrowthStats(startDate),
      getActivityStats(startDate),
      getPopularContentStats(),
      getTrafficStats(startDate)
    ]);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        userGrowth,
        contentGrowth,
        activityStats,
        popularContent,
        trafficStats
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/admin/broadcast - Enviar notificación masiva
router.post('/broadcast', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { title, message, type = 'announcement', targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Título y mensaje son requeridos'
      });
    }

    // Obtener usuarios objetivo
    const where = {
      isActive: true,
      ...(targetRole && { role: targetRole })
    };

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true }
    });

    // Crear notificaciones en lotes
    const batchSize = 1000;
    let createdCount = 0;

    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      const notifications = batch.map(user => ({
        userId: user.id,
        type,
        title,
        message,
        data: { broadcast: true, sentBy: req.user.id }
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      createdCount += notifications.length;
    }

    // Log de la acción
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'BROADCAST_NOTIFICATION',
        targetType: 'NOTIFICATION',
        details: { title, message, type, targetRole, recipientCount: createdCount },
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      data: { recipientCount: createdCount },
      message: `Notificación enviada a ${createdCount} usuarios`
    });

  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/logs - Logs de administración
router.get('/logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action || '';
    const adminId = req.query.adminId || '';
    const skip = (page - 1) * limit;

    const where = {
      ...(action && { action }),
      ...(adminId && { adminId: parseInt(adminId) })
    };

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: { select: { username: true } }
        }
      }),
      prisma.adminLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Funciones helper
async function getSystemStats() {
  try {
    const [dbSize, storageUsage] = await Promise.all([
      prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
      CloudinaryService.getUsageStats().catch(() => ({ data: null }))
    ]);

    return {
      database: {
        size: dbSize[0]?.size || 'N/A'
      },
      storage: storageUsage.data || null,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
  } catch (error) {
    return {
      database: { size: 'N/A' },
      storage: null,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
  }
}

async function getUserGrowthStats(startDate) {
  const users = await prisma.user.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: startDate } },
    _count: true
  });

  return processDateStats(users, '_count');
}

async function getContentGrowthStats(startDate) {
  const [mangas, chapters, comments] = await Promise.all([
    prisma.manga.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true
    }),
    prisma.chapter.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true
    }),
    prisma.comment.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true
    })
  ]);

  return {
    mangas: processDateStats(mangas, '_count'),
    chapters: processDateStats(chapters, '_count'),
    comments: processDateStats(comments, '_count')
  };
}

async function getActivityStats(startDate) {
  // Implementar estadísticas de actividad
  return {
    pageViews: 0,
    uniqueVisitors: 0,
    averageSessionTime: 0
  };
}

async function getPopularContentStats() {
  const [topMangas, topAuthors, topGenres] = await Promise.all([
    prisma.manga.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: { title: true, views: true, favoriteCount: true }
    }),
    prisma.manga.groupBy({
      by: ['author'],
      _count: true,
      _sum: { views: true },
      orderBy: { _sum: { views: 'desc' } },
      take: 10
    }),
    getTopGenres()
  ]);

  return {
    mangas: topMangas,
    authors: topAuthors,
    genres: topGenres
  };
}

async function getTopGenres() {
  const mangas = await prisma.manga.findMany({
    select: { genres: true, favoriteCount: true }
  });

  const genreStats = {};
  mangas.forEach(manga => {
    manga.genres.forEach(genre => {
      if (!genreStats[genre]) {
        genreStats[genre] = { count: 0, favorites: 0 };
      }
      genreStats[genre].count++;
      genreStats[genre].favorites += manga.favoriteCount || 0;
    });
  });

  return Object.entries(genreStats)
    .sort((a, b) => b[1].favorites - a[1].favorites)
    .slice(0, 10)
    .map(([genre, stats]) => ({ genre, ...stats }));
}

async function getTrafficStats(startDate) {
  // Implementar estadísticas de tráfico
  return {
    totalPageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    averageSessionTime: 0
  };
}

function processDateStats(data, countField) {
  const dailyStats = {};
  
  data.forEach(item => {
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    dailyStats[date] = (dailyStats[date] || 0) + item[countField];
  });

  return Object.entries(dailyStats).map(([date, count]) => ({
    date,
    count
  }));
}

module.exports = router;