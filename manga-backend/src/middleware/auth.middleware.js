const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware de autenticación JWT
 * Verifica el token y carga los datos del usuario
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        level: true,
        experience: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada'
      });
    }

    // Adjuntar usuario a la request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expirado'
      });
    }

    console.error('Error en authenticateToken:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Carga el usuario si hay token, pero no falla si no hay
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        level: true,
        experience: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    req.user = user && user.isActive ? user : null;
    next();

  } catch (error) {
    // En caso de error, simplemente no cargar usuario
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar roles de administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }

  next();
};

/**
 * Middleware para verificar roles de moderador o superior
 */
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  const allowedRoles = ['moderator', 'admin', 'super_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de moderador'
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea el propietario del recurso
 */
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    // Permitir a administradores acceso total
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Verificar propiedad del recurso
    const resourceUserId = req.body[userIdField] || req.params[userIdField];
    
    if (!resourceUserId || parseInt(resourceUserId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el email esté verificado
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email no verificado. Verifica tu email para continuar'
    });
  }

  next();
};

/**
 * Middleware para verificar nivel mínimo de usuario
 */
const requireLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    if (req.user.level < minLevel) {
      return res.status(403).json({
        success: false,
        error: `Se requiere nivel ${minLevel} o superior. Tu nivel actual: ${req.user.level}`
      });
    }

    next();
  };
};

/**
 * Middleware para rate limiting por usuario
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next(); // Sin límite para usuarios no autenticados (se maneja por IP)
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const currentRequests = userRequests.get(userId);

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Agregar request actual
    currentRequests.push(now);
    userRequests.set(userId, currentRequests);

    next();
  };
};

/**
 * Middleware para logging de actividad del usuario
 */
const logUserActivity = (action) => {
  return async (req, res, next) => {
    if (req.user) {
      try {
        // Log de actividad (opcional - solo si quieres trackear)
        await prisma.userActivity.create({
          data: {
            userId: req.user.id,
            action: action || req.method + ' ' + req.path,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method === 'POST' ? req.body : undefined
            }
          }
        }).catch(err => {
          // Fallo silencioso para no interrumpir la request
          console.error('Error logging user activity:', err);
        });
      } catch (error) {
        // Fallo silencioso
      }
    }
    next();
  };
};

/**
 * Generar token JWT
 */
const generateToken = (userId, options = {}) => {
  const payload = { userId };
  const defaultOptions = {
    expiresIn: '24h',
    issuer: 'mangaverse-api'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { ...defaultOptions, ...options });
};

/**
 * Generar refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = { userId, type: 'refresh' };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'mangaverse-api'
  });
};

/**
 * Verificar refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Middleware para validar formato de email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Middleware para validar fortaleza de contraseña
 */
const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos una letra y un número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Middleware para verificar si el usuario puede realizar una acción específica
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    try {
      // Verificar permisos en base de datos
      const userPermissions = await prisma.userPermission.findMany({
        where: { userId: req.user.id },
        include: { permission: true }
      });

      const hasPermission = userPermissions.some(up => 
        up.permission.name === permission || 
        up.permission.name === 'all' ||
        req.user.role === 'super_admin'
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `Permiso insuficiente: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        success: false,
        error: 'Error verificando permisos'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireModerator,
  requireOwnership,
  requireVerifiedEmail,
  requireLevel,
  userRateLimit,
  logUserActivity,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  validateEmail,
  validatePassword,
  checkPermission
};