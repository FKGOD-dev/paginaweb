const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Importar rutas
const mangaRoutes = require('./routes/manga.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const commentsRoutes = require('./routes/comments.routes');
const listsRoutes = require('./routes/lists.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const searchRoutes = require('./routes/search.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const adminRoutes = require('./routes/admin.routes');

// Importar middlewares
const { authenticateToken, optionalAuth } = require('./middleware/auth.middleware');
const { sanitize, createRateLimit } = require('./middleware/validation.middleware');

// Importar servicios
const emailService = require('./services/email.service');
const CloudinaryService = require('./services/cloudinary.service');

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3001;

// Crear directorios necesarios si no existen
const createDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/temp',
    'uploads/manga',
    'uploads/avatars',
    'logs'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Configurar logging
const setupLogging = () => {
  // Crear stream de log
  const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

  // Configurar morgan para desarrollo y producción
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: logStream }));
  } else {
    app.use(morgan('dev'));
  }
};

// Configurar rate limiting
const setupRateLimiting = () => {
  // Rate limiting general
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: {
      success: false,
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Rate limiting para auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos de login
    message: {
      success: false,
      error: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.'
    },
    skipSuccessfulRequests: true
  });

  // Rate limiting para upload
  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50, // máximo 50 uploads por hora
    message: {
      success: false,
      error: 'Límite de uploads alcanzado, intenta de nuevo más tarde.'
    }
  });

  // Rate limiting para búsquedas
  const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // máximo 60 búsquedas por minuto
    message: {
      success: false,
      error: 'Demasiadas búsquedas, intenta de nuevo más tarde.'
    }
  });

  // Aplicar rate limiting
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/upload/', uploadLimiter);
  app.use('/api/search/', searchLimiter);
};

// Configurar CORS
const setupCORS = () => {
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173'
      ];

      // Permitir requests sin origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma'
    ]
  };

  app.use(cors(corsOptions));
};

// Configurar middlewares de seguridad
const setupSecurity = () => {
  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Compresión de respuestas
  app.use(compression());
};

// Configurar middlewares de parseo
const setupParsing = () => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitize); // Sanitizar datos de entrada
};

// Configurar rutas estáticas
const setupStaticFiles = () => {
  // Servir archivos subidos
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Servir archivos estáticos del frontend en producción
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
  }
};

// Configurar rutas de la API
const setupAPIRoutes = () => {
  // Rutas públicas
  app.use('/api/auth', userRoutes); // Login, registro, etc.
  app.use('/api/manga', mangaRoutes);
  app.use('/api/search', searchRoutes);
  
  // Rutas con autenticación opcional
  app.use('/api/comments', commentsRoutes);
  
  // Rutas que requieren autenticación
  app.use('/api/users', authenticateToken, userRoutes);
  app.use('/api/upload', authenticateToken, uploadRoutes);
  app.use('/api/lists', listsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/notifications', authenticateToken, notificationsRoutes);
  
  // Rutas de administración
  app.use('/api/admin', authenticateToken, adminRoutes);
};

// Configurar rutas especiales
const setupSpecialRoutes = () => {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API info
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'MangaVerse API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        manga: '/api/manga',
        users: '/api/users',
        search: '/api/search',
        comments: '/api/comments',
        lists: '/api/lists',
        favorites: '/api/favorites',
        notifications: '/api/notifications',
        upload: '/api/upload',
        admin: '/api/admin'
      },
      documentation: '/api/docs'
    });
  });

  // Servir documentación (si existe)
  app.get('/api/docs', (req, res) => {
    res.json({
      success: true,
      message: 'API Documentation',
      note: 'Documentation will be available soon'
    });
  });

  // Fallback para SPA en producción
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }
};

// Middleware de manejo de errores
const setupErrorHandling = () => {
  // Middleware para rutas no encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  });

  // Middleware global de manejo de errores
  app.use((error, req, res, next) => {
    console.error('❌ Error:', error);

    // Error de CORS
    if (error.message === 'No permitido por CORS') {
      return res.status(403).json({
        success: false,
        error: 'CORS error: Origin not allowed'
      });
    }

    // Error de rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }

    // Error de parsing JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON format'
      });
    }

    // Error de validación de Joi
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details
      });
    }

    // Error de Prisma
    if (error.code && error.code.startsWith('P')) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        code: process.env.NODE_ENV === 'development' ? error.code : undefined
      });
    }

    // Error genérico
    res.status(error.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
};

// Inicializar servicios
const initializeServices = async () => {
  try {
    console.log('🔧 Initializing services...');

    // Validar configuración de Cloudinary
    if (CloudinaryService.validateConfig()) {
      console.log('☁️ Cloudinary service ready');
    }

    // Inicializar servicio de email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await emailService.initialize();
      console.log('📧 Email service ready');
    } else {
      console.warn('⚠️ Email service not configured');
    }

    console.log('✅ Services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Starting MangaVerse API Server...');

    // Crear directorios necesarios
    createDirectories();

    // Configurar middlewares y rutas
    setupLogging();
    setupSecurity();
    setupCORS();
    setupRateLimiting();
    setupParsing();
    setupStaticFiles();
    setupAPIRoutes();
    setupSpecialRoutes();
    setupErrorHandling();

    // Inicializar servicios
    await initializeServices();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('\n🎉 MangaVerse API Server started successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log('\n📚 Available endpoints:');
      console.log('   • POST /api/auth/register - User registration');
      console.log('   • POST /api/auth/login - User login');
      console.log('   • GET /api/manga - List mangas');
      console.log('   • GET /api/search/manga - Search mangas');
      console.log('   • GET /api/users/profile - User profile');
      console.log('   • POST /api/upload/avatar - Upload avatar');
      console.log('   • GET /api/admin/dashboard - Admin dashboard');
      console.log('\n🔥 Ready to serve manga content!');
    });

    // Manejo graceful de cierre del servidor
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed gracefully');
        process.exit(0);
      });
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Exportar app para testing
module.exports = app;

// Iniciar servidor si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}