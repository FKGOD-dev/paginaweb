const { z } = require('zod');

// Schemas de validación
const getNotificationsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  type: z.enum(['NEW_CHAPTER', 'NEW_EPISODE', 'COMMENT_REPLY', 'REVIEW_LIKE', 'NEW_FOLLOWER', 'ACHIEVEMENT', 'SYSTEM']).optional(),
  unreadOnly: z.boolean().default(false)
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1, 'Debe especificar al menos una notificación')
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  types: z.object({
    NEW_CHAPTER: z.boolean().optional(),
    NEW_EPISODE: z.boolean().optional(),
    COMMENT_REPLY: z.boolean().optional(),
    REVIEW_LIKE: z.boolean().optional(),
    NEW_FOLLOWER: z.boolean().optional(),
    ACHIEVEMENT: z.boolean().optional(),
    SYSTEM: z.boolean().optional()
  }).optional()
});

async function notificationsRoutes(fastify, options) {
  
  // Helper para formatear notificaciones
  const formatNotification = (notification) => {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      timeAgo: getTimeAgo(notification.createdAt),
      icon: getNotificationIcon(notification.type),
      actionUrl: getActionUrl(notification.type, notification.data)
    };
  };
  
  // Helper para obtener tiempo relativo
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return new Date(date).toLocaleDateString();
  };
  
  // Helper para obtener icono de notificación
  const getNotificationIcon = (type) => {
    const icons = {
      NEW_CHAPTER: '📖',
      NEW_EPISODE: '📺',
      COMMENT_REPLY: '💬',
      REVIEW_LIKE: '❤️',
      NEW_FOLLOWER: '👥',
      ACHIEVEMENT: '🏆',
      SYSTEM: '🔔'
    };
    return icons[type] || '🔔';
  };
  
  // Helper para obtener URL de acción
  const getActionUrl = (type, data) => {
    if (!data) return null;
    
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      switch (type) {
        case 'NEW_CHAPTER':
          return parsedData.mangaId ? `/manga/${parsedData.mangaId}` : null;
        case 'NEW_EPISODE':
          return parsedData.animeId ? `/anime/${parsedData.animeId}` : null;
        case 'COMMENT_REPLY':
          return parsedData.commentId ? `/comments/${parsedData.commentId}` : null;
        case 'NEW_FOLLOWER':
          return parsedData.followerUsername ? `/users/${parsedData.followerUsername}` : null;
        case 'ACHIEVEMENT':
          return '/profile/achievements';
        default:
          return null;
      }
    } catch (error) {
      fastify.log.error('Error parsing notification data:', error);
      return null;
    }
  };
  
  // Helper para enviar notificación en tiempo real
  const sendRealTimeNotification = async (userId, notification) => {
    try {
      // Enviar vía WebSocket si está implementado
      if (fastify.websocketClients && fastify.websocketClients.has(userId)) {
        const client = fastify.websocketClients.get(userId);
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'notification',
            data: formatNotification(notification)
          }));
        }
      }
      
      // Almacenar en Redis para notificaciones persistentes
      const redisKey = `notifications:${userId}`;
      await fastify.redis.lpush(redisKey, JSON.stringify(formatNotification(notification)));
      await fastify.redis.ltrim(redisKey, 0, 99); // Mantener solo las últimas 100
      await fastify.redis.expire(redisKey, 86400 * 7); // Expirar en 7 días
      
    } catch (error) {
      fastify.log.error('Error enviando notificación en tiempo real:', error);
    }
  };
  
  // 🔔 OBTENER NOTIFICACIONES
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { page, limit, type, unreadOnly } = getNotificationsSchema.parse(request.query);
      
      // Construir filtros
      const where = { userId };
      if (type) where.type = type;
      if (unreadOnly) where.isRead = false;
      
      // Ejecutar consulta
      const [notifications, total, unreadCount] = await Promise.all([
        fastify.prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        fastify.prisma.notification.count({ where }),
        fastify.prisma.notification.count({
          where: { userId, isRead: false }
        })
      ]);
      
      // Formatear notificaciones
      const formattedNotifications = notifications.map(formatNotification);
      
      reply.send({
        notifications: formattedNotifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Parámetros inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 📖 MARCAR COMO LEÍDAS
  fastify.post('/mark-read', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { notificationIds } = markAsReadSchema.parse(request.body);
      
      // Verificar que las notificaciones pertenecen al usuario
      const notifications = await fastify.prisma.notification.findMany({
        where: {
          id: { in: notificationIds },
          userId
        },
        select: { id: true }
      });
      
      const validIds = notifications.map(n => n.id);
      
      if (validIds.length === 0) {
        return reply.code(404).send({ error: 'Notificaciones no encontradas' });
      }
      
      // Marcar como leídas
      const updateResult = await fastify.prisma.notification.updateMany({
        where: {
          id: { in: validIds },
          userId
        },
        data: { isRead: true }
      });
      
      // Obtener nuevo conteo de no leídas
      const unreadCount = await fastify.prisma.notification.count({
        where: { userId, isRead: false }
      });
      
      reply.send({
        message: `${updateResult.count} notificaciones marcadas como leídas`,
        markedCount: updateResult.count,
        unreadCount
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 📖 MARCAR TODAS COMO LEÍDAS
  fastify.post('/mark-all-read', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const updateResult = await fastify.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: { isRead: true }
      });
      
      reply.send({
        message: `${updateResult.count} notificaciones marcadas como leídas`,
        markedCount: updateResult.count,
        unreadCount: 0
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🗑️ ELIMINAR NOTIFICACIÓN
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      
      const notification = await fastify.prisma.notification.findFirst({
        where: { id, userId }
      });
      
      if (!notification) {
        return reply.code(404).send({ error: 'Notificación no encontrada' });
      }
      
      await fastify.prisma.notification.delete({
        where: { id }
      });
      
      reply.send({ message: 'Notificación eliminada exitosamente' });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🗑️ ELIMINAR TODAS LAS NOTIFICACIONES LEÍDAS
  fastify.delete('/read', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const deleteResult = await fastify.prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true
        }
      });
      
      reply.send({
        message: `${deleteResult.count} notificaciones eliminadas`,
        deletedCount: deleteResult.count
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // ⚙️ OBTENER PREFERENCIAS DE NOTIFICACIONES
  fastify.get('/preferences', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Buscar preferencias existentes
      let preferences = await fastify.prisma.notificationPreferences.findUnique({
        where: { userId }
      });
      
      // Si no existen, crear con valores por defecto
      if (!preferences) {
        preferences = await fastify.prisma.notificationPreferences.create({
          data: {
            userId,
            emailNotifications: true,
            pushNotifications: true,
            types: {
              NEW_CHAPTER: true,
              NEW_EPISODE: true,
              COMMENT_REPLY: true,
              REVIEW_LIKE: true,
              NEW_FOLLOWER: true,
              ACHIEVEMENT: true,
              SYSTEM: true
            }
          }
        });
      }
      
      reply.send({
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        types: preferences.types || {
          NEW_CHAPTER: true,
          NEW_EPISODE: true,
          COMMENT_REPLY: true,
          REVIEW_LIKE: true,
          NEW_FOLLOWER: true,
          ACHIEVEMENT: true,
          SYSTEM: true
        }
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // ⚙️ ACTUALIZAR PREFERENCIAS
  fastify.put('/preferences', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = updatePreferencesSchema.parse(request.body);
      
      // Preparar datos de actualización
      const updateData = {};
      if (data.emailNotifications !== undefined) {
        updateData.emailNotifications = data.emailNotifications;
      }
      if (data.pushNotifications !== undefined) {
        updateData.pushNotifications = data.pushNotifications;
      }
      if (data.types) {
        updateData.types = data.types;
      }
      
      // Upsert preferencias
      const preferences = await fastify.prisma.notificationPreferences.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          emailNotifications: data.emailNotifications ?? true,
          pushNotifications: data.pushNotifications ?? true,
          types: data.types || {
            NEW_CHAPTER: true,
            NEW_EPISODE: true,
            COMMENT_REPLY: true,
            REVIEW_LIKE: true,
            NEW_FOLLOWER: true,
            ACHIEVEMENT: true,
            SYSTEM: true
          }
        }
      });
      
      reply.send({
        message: 'Preferencias actualizadas exitosamente',
        preferences: {
          emailNotifications: preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications,
          types: preferences.types
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 📊 ESTADÍSTICAS DE NOTIFICACIONES
  fastify.get('/stats', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const [
        totalNotifications,
        unreadCount,
        typeStats,
        recentActivity
      ] = await Promise.all([
        fastify.prisma.notification.count({ where: { userId } }),
        fastify.prisma.notification.count({ where: { userId, isRead: false } }),
        fastify.prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: true,
          orderBy: { _count: { type: 'desc' } }
        }),
        fastify.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            type: true,
            title: true,
            createdAt: true,
            isRead: true
          }
        })
      ]);
      
      // Estadísticas de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const weeklyStats = await fastify.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM notifications 
        WHERE user_id = ${userId} 
        AND created_at >= ${sevenDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      const stats = {
        totals: {
          total: totalNotifications,
          unread: unreadCount,
          read: totalNotifications - unreadCount,
          readPercentage: totalNotifications > 0 
            ? ((totalNotifications - unreadCount) / totalNotifications * 100).toFixed(1)
            : 0
        },
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count,
          icon: getNotificationIcon(stat.type)
        })),
        weeklyActivity: weeklyStats.map(day => ({
          date: day.date,
          count: parseInt(day.count)
        })),
        recentActivity: recentActivity.map(notification => ({
          ...notification,
          timeAgo: getTimeAgo(notification.createdAt),
          icon: getNotificationIcon(notification.type)
        }))
      };
      
      reply.send(stats);
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🧹 LIMPIAR NOTIFICACIONES ANTIGUAS
  fastify.post('/cleanup', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { days = 30 } = request.body;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const deleteResult = await fastify.prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
          createdAt: {
            lt: cutoffDate
          }
        }
      });
      
      reply.send({
        message: `${deleteResult.count} notificaciones antiguas eliminadas`,
        deletedCount: deleteResult.count,
        cutoffDate
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔔 OBTENER CONTEO DE NO LEÍDAS (endpoint rápido)
  fastify.get('/unread-count', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Intentar obtener de Redis primero (cache)
      const cacheKey = `unread_count:${userId}`;
      let unreadCount = await fastify.redis.get(cacheKey);
      
      if (unreadCount === null) {
        // Si no está en cache, obtener de BD
        unreadCount = await fastify.prisma.notification.count({
          where: { userId, isRead: false }
        });
        
        // Guardar en cache por 1 minuto
        await fastify.redis.setex(cacheKey, 60, unreadCount.toString());
      } else {
        unreadCount = parseInt(unreadCount);
      }
      
      reply.send({ unreadCount });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔄 WEBHOOK PARA NOTIFICACIONES PUSH (Admin)
  fastify.post('/push-webhook', async (request, reply) => {
    try {
      const userRole = request.user?.role;
      
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return reply.code(403).send({ error: 'Permisos insuficientes' });
      }
      
      const { userId, title, message, data, type = 'SYSTEM' } = request.body;
      
      if (!userId || !title || !message) {
        return reply.code(400).send({
          error: 'userId, title y message son requeridos'
        });
      }
      
      // Crear notificación
      const notification = await fastify.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: data ? JSON.stringify(data) : null
        }
      });
      
      // Enviar en tiempo real
      await sendRealTimeNotification(userId, notification);
      
      reply.send({
        message: 'Notificación enviada exitosamente',
        notificationId: notification.id
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // Exponer helper para uso en otras rutas
  fastify.decorate('sendNotification', async (userId, type, title, message, data = null) => {
    try {
      const notification = await fastify.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: data ? JSON.stringify(data) : null
        }
      });
      
      await sendRealTimeNotification(userId, notification);
      return notification;
    } catch (error) {
      fastify.log.error('Error sending notification:', error);
      return null;
    }
  });
}

module.exports = notificationsRoutes;