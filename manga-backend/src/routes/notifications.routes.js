const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// GET /api/notifications - Obtener notificaciones del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || ''; // chapter_update, comment_reply, like, follow, etc.
    const unreadOnly = req.query.unreadOnly === 'true';
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/notifications/unread-count - Contador de no leídas
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/:notificationId/read - Marcar como leída
router.put('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/mark-all-read - Marcar todas como leídas
router.put('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} notificaciones marcadas como leídas`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/notifications/:notificationId - Eliminar notificación
router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    await prisma.notification.delete({
      where: { id: parseInt(notificationId) }
    });

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/notifications/clear-all - Limpiar todas las notificaciones
router.delete('/clear-all', requireAuth, async (req, res) => {
  try {
    const { readOnly = false } = req.query;

    const where = {
      userId: req.user.id,
      ...(readOnly === 'true' && { isRead: true })
    };

    const result = await prisma.notification.deleteMany({ where });

    res.json({
      success: true,
      data: { deletedCount: result.count },
      message: `${result.count} notificaciones eliminadas`
    });

  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/notifications/settings - Configuración de notificaciones
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    // Configuración por defecto si no existe
    const defaultSettings = {
      chapterUpdates: true,
      commentReplies: true,
      likes: true,
      follows: true,
      recommendations: true,
      systemUpdates: true,
      emailNotifications: false,
      pushNotifications: true
    };

    res.json({
      success: true,
      data: settings || defaultSettings
    });

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/settings - Actualizar configuración
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const {
      chapterUpdates = true,
      commentReplies = true,
      likes = true,
      follows = true,
      recommendations = true,
      systemUpdates = true,
      emailNotifications = false,
      pushNotifications = true
    } = req.body;

    const settings = await prisma.userNotificationSettings.upsert({
      where: { userId: req.user.id },
      update: {
        chapterUpdates,
        commentReplies,
        likes,
        follows,
        recommendations,
        systemUpdates,
        emailNotifications,
        pushNotifications
      },
      create: {
        userId: req.user.id,
        chapterUpdates,
        commentReplies,
        likes,
        follows,
        recommendations,
        systemUpdates,
        emailNotifications,
        pushNotifications
      }
    });

    res.json({
      success: true,
      data: settings,
      message: 'Configuración actualizada'
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/notifications/test - Enviar notificación de prueba (solo admin)
router.post('/test', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo administradores pueden enviar notificaciones de prueba'
      });
    }

    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Título y mensaje son requeridos'
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: req.user.id,
        type,
        title,
        message,
        data: { test: true }
      }
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificación de prueba enviada'
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;