const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación (importar del auth.middleware.js)
const requireAuth = (req, res, next) => {
  // Simulación - en producción usar el middleware real
  req.user = { id: 1, username: 'TestUser', role: 'user', email: 'test@test.com' };
  next();
};

const optionalAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user', email: 'test@test.com' };
  next();
};

// Configuración de email
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Funciones helper
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos una letra y un número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

const calculateLevel = (experience) => {
  // Fórmula: nivel = floor(sqrt(experience / 100))
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

const getNextLevelXP = (level) => {
  // XP necesario para el siguiente nivel
  return Math.pow(level, 2) * 100;
};

// POST /api/users/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de usuario debe tener entre 3 y 20 caracteres'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres, una letra y un número'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Las contraseñas no coinciden'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: { equals: username, mode: 'insensitive' } }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email.toLowerCase() 
          ? 'Este email ya está registrado' 
          : 'Este nombre de usuario ya está en uso'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        verificationToken,
        isVerified: false,
        level: 1,
        experience: 0,
        role: 'user'
      },
      select: {
        id: true,
        username: true,
        email: true,
        level: true,
        experience: true,
        isVerified: true,
        createdAt: true
      }
    });

    // Enviar email de verificación
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await transporter.sendMail({
        to: email,
        subject: 'Verifica tu cuenta en MangaVerse',
        html: `
          <h2>¡Bienvenido a MangaVerse!</h2>
          <p>Hola ${username},</p>
          <p>Gracias por registrarte. Para completar tu registro, verifica tu email haciendo clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar Email</a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p>${verificationUrl}</p>
          <p>Este enlace expira en 24 horas.</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // No fallar el registro si el email no se puede enviar
    }

    // Generar tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Guardar refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      }
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      },
      message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.'
    });

  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/login - Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        _count: {
          select: {
            favorites: true,
            comments: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacta al soporte.'
      });
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    // Generar tokens
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
    const refreshToken = generateRefreshToken(user.id);

    // Guardar refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000)
      }
    });

    // Preparar datos del usuario (sin contraseña)
    const { password: _, verificationToken, ...userData } = user;

    res.json({
      success: true,
      data: {
        user: userData,
        token,
        refreshToken
      },
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/refresh-token - Renovar token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }

    // Verificar refresh token en base de datos
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido o expirado'
      });
    }

    // Generar nuevo token de acceso
    const newToken = generateToken(storedToken.userId);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/logout - Cerrar sesión
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Eliminar refresh token de la base de datos
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user.id
        }
      });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/verify-email - Verificar email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación requerido'
      });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación inválido'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email ya verificado'
      });
    }

    // Verificar email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        experience: { increment: 50 } // Bonus por verificar email
      }
    });

    res.json({
      success: true,
      message: 'Email verificado exitosamente. ¡Has ganado 50 XP!'
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/profile - Obtener perfil del usuario actual
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        favorites: {
          include: {
            manga: {
              select: { id: true, title: true, cover: true, rating: true }
            }
          },
          take: 10
        },
        readingProgress: {
          include: {
            manga: {
              select: { id: true, title: true, cover: true }
            },
            chapter: {
              select: { id: true, number: true, title: true }
            }
          },
          take: 10,
          orderBy: { updatedAt: 'desc' }
        },
        _count: {
          select: {
            favorites: true,
            comments: true,
            reviews: true,
            readingProgress: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Calcular estadísticas adicionales
    const totalChaptersRead = await prisma.readingProgress.aggregate({
      where: { userId: req.user.id },
      _sum: { lastChapterRead: true }
    });

    const currentLevel = calculateLevel(user.experience);
    const nextLevelXP = getNextLevelXP(currentLevel);

    // Preparar datos (sin información sensible)
    const { password, verificationToken, ...userData } = user;

    res.json({
      success: true,
      data: {
        ...userData,
        level: currentLevel,
        nextLevelXP,
        stats: {
          totalChaptersRead: totalChaptersRead._sum.lastChapterRead || 0,
          ...user._count
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/profile - Actualizar perfil
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const {
      username,
      bio,
      website,
      location,
      favoriteGenres,
      isProfilePublic = true
    } = req.body;

    // Validaciones
    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de usuario debe tener entre 3 y 20 caracteres'
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'La biografía no puede exceder 500 caracteres'
      });
    }

    // Verificar que el username no esté en uso (si se está cambiando)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          id: { not: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Este nombre de usuario ya está en uso'
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (location !== undefined) updateData.location = location;
    if (favoriteGenres !== undefined) updateData.favoriteGenres = favoriteGenres;
    if (isProfilePublic !== undefined) updateData.isProfilePublic = isProfilePublic;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        website: true,
        location: true,
        avatar: true,
        favoriteGenres: true,
        isProfilePublic: true,
        level: true,
        experience: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/:userId - Obtener perfil público de usuario
router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        bio: true,
        website: true,
        location: true,
        avatar: true,
        favoriteGenres: true,
        level: true,
        experience: true,
        isProfilePublic: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            comments: true,
            reviews: true,
            readingProgress: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar privacidad del perfil
    if (!user.isProfilePublic && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Perfil privado'
      });
    }

    // Si el perfil es público o es el propio usuario, mostrar más detalles
    let additionalData = {};
    if (user.isProfilePublic || (req.user && req.user.id === user.id)) {
      const [recentActivity, topFavorites] = await Promise.all([
        prisma.comment.findMany({
          where: { userId: parseInt(userId) },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            manga: { select: { id: true, title: true } },
            chapter: { select: { id: true, number: true } }
          }
        }),
        prisma.favorite.findMany({
          where: { userId: parseInt(userId) },
          take: 6,
          include: {
            manga: {
              select: { id: true, title: true, cover: true, rating: true }
            }
          }
        })
      ]);

      additionalData = {
        recentActivity,
        topFavorites
      };
    }

    const currentLevel = calculateLevel(user.experience);
    const nextLevelXP = getNextLevelXP(currentLevel);

    res.json({
      success: true,
      data: {
        ...user,
        level: currentLevel,
        nextLevelXP,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/change-password - Cambiar contraseña
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Las contraseñas nuevas no coinciden'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres, una letra y un número'
      });
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    // Invalidar todos los refresh tokens existentes por seguridad
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente.'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/forgot-password - Recuperar contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email válido requerido'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Siempre devolver success para evitar enumeración de usuarios
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry
      }
    });

    // Enviar email de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        to: email,
        subject: 'Recuperar contraseña - MangaVerse',
        html: `
          <h2>Recuperar contraseña</h2>
          <p>Hola ${user.username},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p>${resetUrl}</p>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.'
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/reset-password - Restablecer contraseña
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Las contraseñas no coinciden'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres, una letra y un número'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña y limpiar tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    });

    // Invalidar todos los refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Por favor, inicia sesión.'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/search - Buscar usuarios
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Consulta de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } }
              ]
            },
            { isProfilePublic: true },
            { isActive: true }
          ]
        },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          username: true,
          bio: true,
          avatar: true,
          level: true,
          createdAt: true,
          _count: {
            select: {
              favorites: true,
              comments: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { level: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.user.count({
        where: {
          AND: [
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } }
              ]
            },
            { isProfilePublic: true },
            { isActive: true }
          ]
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/users/account - Eliminar cuenta
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const { password, confirmDeletion } = req.body;

    if (!password || confirmDeletion !== 'DELETE') {
      return res.status(400).json({
        success: false,
        error: 'Contraseña y confirmación requeridas'
      });
    }

    // Verificar contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    // En lugar de eliminar completamente, desactivar la cuenta
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}@mangaverse.com`,
        username: `deleted_user_${Date.now()}`,
        bio: null,
        avatar: null,
        deletedAt: new Date()
      }
    });

    // Eliminar todos los refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;