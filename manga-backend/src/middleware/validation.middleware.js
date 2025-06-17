const Joi = require('joi');

/**
 * Middleware de validación usando Joi
 */

// Esquemas de validación base
const schemas = {
  // Validación de usuario
  userRegistration: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'string.max': 'El nombre de usuario no puede exceder 20 caracteres',
        'any.required': 'El nombre de usuario es requerido'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email inválido',
        'any.required': 'El email es requerido'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una letra y un número',
        'any.required': 'La contraseña es requerida'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Confirmar contraseña es requerido'
      })
  }),

  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email inválido',
        'any.required': 'El email es requerido'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'La contraseña es requerida'
      }),
    
    rememberMe: Joi.boolean().default(false)
  }),

  userProfileUpdate: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .optional(),
    
    bio: Joi.string()
      .max(500)
      .allow('')
      .optional(),
    
    website: Joi.string()
      .uri()
      .allow('')
      .optional(),
    
    location: Joi.string()
      .max(100)
      .allow('')
      .optional(),
    
    favoriteGenres: Joi.array()
      .items(Joi.string())
      .max(10)
      .optional(),
    
    isProfilePublic: Joi.boolean()
      .optional()
  }),

  // Validación de manga
  mangaCreation: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'El título es requerido',
        'string.max': 'El título no puede exceder 200 caracteres'
      }),
    
    alternativeTitle: Joi.string()
      .max(200)
      .allow('')
      .optional(),
    
    author: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'El autor es requerido',
        'string.max': 'El nombre del autor no puede exceder 100 caracteres'
      }),
    
    artist: Joi.string()
      .max(100)
      .optional(),
    
    synopsis: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'La sinopsis debe tener al menos 10 caracteres',
        'string.max': 'La sinopsis no puede exceder 2000 caracteres'
      }),
    
    genres: Joi.array()
      .items(Joi.string())
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Se requiere al menos un género',
        'array.max': 'No se pueden seleccionar más de 10 géneros'
      }),
    
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    
    status: Joi.string()
      .valid('ongoing', 'completed', 'hiatus', 'cancelled')
      .default('ongoing'),
    
    type: Joi.string()
      .valid('manga', 'manhwa', 'manhua', 'anime')
      .default('manga'),
    
    rating: Joi.number()
      .min(0)
      .max(10)
      .optional()
  }),

  // Validación de comentarios
  commentCreation: Joi.object({
    content: Joi.string()
      .min(1)
      .max(5000)
      .required()
      .messages({
        'string.min': 'El comentario no puede estar vacío',
        'string.max': 'El comentario no puede exceder 5000 caracteres'
      }),
    
    mangaId: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    chapterId: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    pageNumber: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    parentId: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    spoilerWarning: Joi.boolean()
      .default(false)
  }).or('mangaId', 'chapterId'),

  // Validación de listas
  listCreation: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'El nombre de la lista es requerido',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional(),
    
    category: Joi.string()
      .valid('recommendation', 'collection', 'ranking')
      .default('collection'),
    
    isPublic: Joi.boolean()
      .default(false),
    
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
  }),

  // Validación de búsqueda
  searchQuery: Joi.object({
    q: Joi.string()
      .min(1)
      .max(200)
      .optional(),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
    
    sort: Joi.string()
      .valid('relevance', 'popularity', 'rating', 'latest', 'alphabetical', 'year')
      .default('relevance'),
    
    type: Joi.string()
      .valid('manga', 'manhwa', 'manhua', 'anime')
      .optional(),
    
    status: Joi.string()
      .valid('ongoing', 'completed', 'hiatus', 'cancelled')
      .optional(),
    
    genres: Joi.string()
      .optional(),
    
    excludeGenres: Joi.string()
      .optional(),
    
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    
    yearFrom: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    
    yearTo: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    
    rating: Joi.number()
      .min(0)
      .max(10)
      .optional(),
    
    ratingFrom: Joi.number()
      .min(0)
      .max(10)
      .optional(),
    
    ratingTo: Joi.number()
      .min(0)
      .max(10)
      .optional(),
    
    author: Joi.string()
      .max(100)
      .optional()
  }),

  // Validación de reportes
  reportCreation: Joi.object({
    reason: Joi.string()
      .valid('spam', 'harassment', 'inappropriate', 'copyright', 'other')
      .required()
      .messages({
        'any.only': 'Razón de reporte inválida',
        'any.required': 'La razón del reporte es requerida'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional()
  }),

  // Validación de cambio de contraseña
  passwordChange: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'La contraseña actual es requerida'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
      .required()
      .messages({
        'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'La nueva contraseña debe contener al menos una letra y un número',
        'any.required': 'La nueva contraseña es requerida'
      }),
    
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Confirmar nueva contraseña es requerido'
      })
  }),

  // Validación de paginación
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
  }),

  // Validación de ID de parámetro
  paramId: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID debe ser un número',
        'number.integer': 'ID debe ser un número entero',
        'number.positive': 'ID debe ser un número positivo',
        'any.required': 'ID es requerido'
      })
  }),

  // Validación de notificaciones
  notificationSettings: Joi.object({
    chapterUpdates: Joi.boolean().default(true),
    commentReplies: Joi.boolean().default(true),
    likes: Joi.boolean().default(true),
    follows: Joi.boolean().default(true),
    recommendations: Joi.boolean().default(true),
    systemUpdates: Joi.boolean().default(true),
    emailNotifications: Joi.boolean().default(false),
    pushNotifications: Joi.boolean().default(true)
  }),

  // Validación de admin
  adminUserUpdate: Joi.object({
    role: Joi.string()
      .valid('user', 'moderator', 'admin', 'super_admin')
      .optional(),
    
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    isBanned: Joi.boolean().optional(),
    
    banReason: Joi.string()
      .max(500)
      .optional()
  }),

  adminBroadcast: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required(),
    
    message: Joi.string()
      .min(1)
      .max(2000)
      .required(),
    
    type: Joi.string()
      .valid('announcement', 'maintenance', 'update', 'warning')
      .default('announcement'),
    
    targetRole: Joi.string()
      .valid('user', 'moderator', 'admin')
      .optional()
  })
};

/**
 * Crear middleware de validación
 * @param {string} schemaName - Nombre del esquema a usar
 * @param {string} source - Fuente de datos ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
const validate = (schemaName, source = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Esquema de validación no encontrado'
      });
    }

    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Mostrar todos los errores
      allowUnknown: false, // No permitir campos no definidos
      stripUnknown: true // Remover campos no definidos
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        details: errors
      });
    }

    // Reemplazar los datos originales con los validados y limpiados
    req[source] = value;
    next();
  };
};

/**
 * Validación personalizada para archivos subidos
 */
const validateFile = (options = {}) => {
  const {
    required = false,
    maxSize = 10 * 1024 * 1024, // 10MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    fieldName = 'file'
  } = options;

  return (req, res, next) => {
    const file = req.file || req.files?.[fieldName];

    if (required && !file) {
      return res.status(400).json({
        success: false,
        error: 'Archivo requerido'
      });
    }

    if (file) {
      // Validar tamaño
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`
        });
      }

      // Validar tipo
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`
        });
      }

      // Validar nombre de archivo
      if (file.originalname.length > 255) {
        return res.status(400).json({
          success: false,
          error: 'Nombre de archivo demasiado largo'
        });
      }
    }

    next();
  };
};

/**
 * Validación de múltiples archivos
 */
const validateMultipleFiles = (options = {}) => {
  const {
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options;

  return (req, res, next) => {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere al menos un archivo'
      });
    }

    if (files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        error: `Máximo ${maxFiles} archivos permitidos`
      });
    }

    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `El archivo ${file.originalname} excede el tamaño máximo`
        });
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Tipo de archivo no permitido: ${file.originalname}`
        });
      }
    }

    next();
  };
};

/**
 * Sanitizar datos de entrada
 */
const sanitize = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remover caracteres peligrosos básicos
      .replace(/^\s+|\s+$/g, '') // Remover espacios en blanco
      .substring(0, 10000); // Limitar longitud
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    
    return sanitized;
  };

  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Validar que el usuario sea propietario del recurso
 */
const validateOwnership = (resourceModel, userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = parseInt(req.params.id || req.params.resourceId);
      const userId = req.user.id;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'ID de recurso requerido'
        });
      }

      const resource = await resourceModel.findUnique({
        where: { id: resourceId },
        select: { [userIdField]: true }
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Recurso no encontrado'
        });
      }

      if (resource[userIdField] !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error validating ownership:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Rate limiting por IP
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const currentRequests = requests.get(ip);

    if (currentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    currentRequests.push(now);
    requests.set(ip, currentRequests);

    next();
  };
};

module.exports = {
  validate,
  validateFile,
  validateMultipleFiles,
  sanitize,
  validateOwnership,
  createRateLimit,
  schemas
};