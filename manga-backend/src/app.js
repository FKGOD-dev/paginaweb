// 📦 Imports
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
// const { authenticateToken } = require('./middleware/auth.middleware'); // No necesario aquí

const app = express();
const PORT = process.env.PORT || 3001;

// 📁 Crear directorios necesarios
const createDirectories = async () => {
  const dirs = ['uploads/temp', 'uploads/manga', 'uploads/avatars', 'logs'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`❌ Error creating directory ${dir}:`, error.message);
      }
    }
  }
};

// 🔐 Middlewares globales
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Demasiadas solicitudes. Intenta nuevamente en 15 min.' },
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🧪 Health Check y Bienvenida
app.get('/health', (_, res) => res.status(200).json({
  status: 'OK',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  version: '1.0.0'
}));
app.get('/', (_, res) => res.json({
  message: '🎌 Bienvenido a MangaVerse API',
  version: '1.0.0',
  status: 'running'
}));

// 📚 Rutas de la API
try {
  // 👉 Importar rutas
  const authRoutes = require('./routes/auth.routes');
  const userRoutes = require('./routes/user.routes');
  const mangaRoutes = require('./routes/manga.routes');
  const searchRoutes = require('./routes/search.routes');
  const uploadRoutes = require('./routes/upload.routes');
  const adminRoutes = require('./routes/admin.routes');
  const commentsRoutes = require('./routes/comments.routes');
  const favoritesRoutes = require('./routes/favorites.routes');
  const listsRoutes = require('./routes/lists.routes');
  const notificationsRoutes = require('./routes/notifications.routes');

  // 👉 Montar rutas (ORDEN IMPORTANTE)

  // 🔓 Rutas públicas (SIN middleware de autenticación global)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);              // ✅ CAMBIADO: Sin authenticateToken
  app.use('/api/manga', mangaRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/comments', commentsRoutes);

  // 🔐 Rutas que SÍ requieren autenticación global
  // (Solo si NO manejan autenticación internamente)
  app.use('/api/upload', uploadRoutes);           // ✅ CAMBIADO: Sin authenticateToken 
  app.use('/api/lists', listsRoutes);             // ✅ CAMBIADO: Sin authenticateToken
  app.use('/api/favorites', favoritesRoutes);     // ✅ CAMBIADO: Sin authenticateToken
  app.use('/api/notifications', notificationsRoutes); // ✅ CAMBIADO: Sin authenticateToken

  // 🛡 Admin (mantiene protección si es necesario)
  app.use('/api/admin', adminRoutes);             // ✅ CAMBIADO: Sin authenticateToken

  console.log('✅ All routes loaded successfully');

} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}

// ❓ Ruta no encontrada
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// 🚨 Manejo global de errores
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 🚀 Servidor
const startServer = async () => {
  try {
    console.log('🚀 Starting MangaVerse API Server...');
    await createDirectories();
    const server = app.listen(PORT, () => {
      console.log(`🌐 Listening at http://localhost:${PORT}`);
    });

    const shutdown = () => {
      console.log('\n🔄 Shutting down gracefully...');
      server.close(() => {
        console.log('🛑 Server stopped.');
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}
const listEndpoints = require('express-list-endpoints');
console.log(listEndpoints(app));

module.exports = app;