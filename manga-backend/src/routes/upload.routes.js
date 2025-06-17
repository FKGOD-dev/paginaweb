const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp'); // Para optimización de imágenes
const router = express.Router();

const prisma = new PrismaClient();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/temp/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtros de archivos
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten documentos (pdf, doc, docx, txt)'));
  }
};

// Configuraciones de multer
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5
  },
  fileFilter: documentFilter
});

const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: imageFilter
});

// Middleware de autenticación (importar del auth.middleware.js)
const requireAuth = (req, res, next) => {
  // Simulación - en producción usar el middleware real
  req.user = { id: 1, role: 'user' };
  next();
};

// Función para subir a Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });
    
    // Eliminar archivo temporal
    await fs.unlink(filePath).catch(err => console.error('Error deleting temp file:', err));
    
    return result;
  } catch (error) {
    // Eliminar archivo temporal en caso de error
    await fs.unlink(filePath).catch(err => console.error('Error deleting temp file:', err));
    throw error;
  }
};

// Función para optimizar imágenes antes de subir
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 1200,
      height,
      quality = 85,
      format = 'webp'
    } = options;

    let pipeline = sharp(inputPath);
    
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    pipeline = pipeline[format]({ quality });
    
    await pipeline.toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return inputPath; // Retornar archivo original si falla la optimización
  }
};

// POST /api/upload/avatar - Subir avatar de usuario
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    const userId = req.user.id;
    const tempPath = req.file.path;
    const optimizedPath = tempPath.replace(path.extname(tempPath), '_optimized.webp');

    // Optimizar imagen para avatar (cuadrada, 200x200)
    await optimizeImage(tempPath, optimizedPath, {
      width: 200,
      height: 200,
      quality: 90,
      format: 'webp'
    });

    // Subir a Cloudinary
    const cloudinaryResult = await uploadToCloudinary(optimizedPath, {
      folder: 'avatars',
      public_id: `avatar_${userId}_${Date.now()}`,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    // Actualizar avatar del usuario en base de datos
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: cloudinaryResult.secure_url }
    });

    // Eliminar archivo temporal original
    await fs.unlink(tempPath).catch(err => console.error('Error deleting temp file:', err));

    res.json({
      success: true,
      data: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        size: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      },
      message: 'Avatar actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    // Limpiar archivos temporales en caso de error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir avatar'
    });
  }
});

// POST /api/upload/manga-cover - Subir portada de manga
router.post('/manga-cover', requireAuth, uploadImage.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    const { mangaId } = req.body;
    const tempPath = req.file.path;
    const optimizedPath = tempPath.replace(path.extname(tempPath), '_optimized.webp');

    // Optimizar imagen para portada (ratio 3:4)
    await optimizeImage(tempPath, optimizedPath, {
      width: 600,
      quality: 90,
      format: 'webp'
    });

    // Subir a Cloudinary
    const cloudinaryResult = await uploadToCloudinary(optimizedPath, {
      folder: 'manga-covers',
      public_id: `cover_${mangaId || 'temp'}_${Date.now()}`,
      transformation: [
        { width: 600, crop: 'scale' },
        { quality: 'auto' }
      ]
    });

    // Si hay mangaId, actualizar en base de datos
    if (mangaId) {
      await prisma.manga.update({
        where: { id: parseInt(mangaId) },
        data: { cover: cloudinaryResult.secure_url }
      });
    }

    // Eliminar archivo temporal
    await fs.unlink(tempPath).catch(err => console.error('Error deleting temp file:', err));

    res.json({
      success: true,
      data: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        size: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      },
      message: 'Portada subida exitosamente'
    });

  } catch (error) {
    console.error('Error uploading manga cover:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir portada'
    });
  }
});

// POST /api/upload/manga-pages - Subir páginas de manga
router.post('/manga-pages', requireAuth, uploadImage.array('pages', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se han subido archivos'
      });
    }

    const { chapterId, mangaId } = req.body;
    
    if (!chapterId && !mangaId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere chapterId o mangaId'
      });
    }

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        const tempPath = file.path;
        const optimizedPath = tempPath.replace(path.extname(tempPath), '_optimized.webp');

        // Optimizar imagen para página de manga
        await optimizeImage(tempPath, optimizedPath, {
          width: 1200,
          quality: 85,
          format: 'webp'
        });

        // Subir a Cloudinary
        const cloudinaryResult = await uploadToCloudinary(optimizedPath, {
          folder: 'manga-pages',
          public_id: `page_${chapterId || mangaId}_${index + 1}_${Date.now()}`,
          transformation: [
            { width: 1200, crop: 'scale' },
            { quality: 'auto' }
          ]
        });

        // Eliminar archivo temporal
        await fs.unlink(tempPath).catch(err => console.error('Error deleting temp file:', err));

        return {
          index: index + 1,
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          size: cloudinaryResult.bytes,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height
        };

      } catch (error) {
        console.error(`Error uploading page ${index + 1}:`, error);
        await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
        throw error;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Si hay chapterId, guardar páginas en base de datos
    if (chapterId) {
      const pageData = uploadResults.map(result => ({
        chapterId: parseInt(chapterId),
        pageNumber: result.index,
        imageUrl: result.url,
        cloudinaryId: result.publicId
      }));

      await prisma.mangaPage.createMany({
        data: pageData
      });
    }

    res.json({
      success: true,
      data: {
        totalPages: uploadResults.length,
        pages: uploadResults
      },
      message: `${uploadResults.length} páginas subidas exitosamente`
    });

  } catch (error) {
    console.error('Error uploading manga pages:', error);
    
    // Limpiar archivos temporales en caso de error
    if (req.files) {
      req.files.forEach(async (file) => {
        await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir páginas del manga'
    });
  }
});

// POST /api/upload/novel - Subir novela ligera
router.post('/novel', requireAuth, uploadDocument.single('novel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    const { title, description, genre, isPublic = false } = req.body;
    const userId = req.user.id;

    // Subir a Cloudinary como raw file
    const cloudinaryResult = await uploadToCloudinary(req.file.path, {
      folder: 'novels',
      public_id: `novel_${userId}_${Date.now()}`,
      resource_type: 'raw'
    });

    // Guardar información de la novela en base de datos
    const novel = await prisma.userNovel.create({
      data: {
        userId: userId,
        title: title || req.file.originalname,
        description: description || '',
        genre: genre || 'General',
        fileName: req.file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        fileSize: cloudinaryResult.bytes,
        isPublic: isPublic === 'true',
        status: 'draft' // draft, review, published, rejected
      }
    });

    res.json({
      success: true,
      data: {
        novelId: novel.id,
        url: cloudinaryResult.secure_url,
        title: novel.title,
        size: cloudinaryResult.bytes
      },
      message: 'Novela subida exitosamente. En revisión para publicación.'
    });

  } catch (error) {
    console.error('Error uploading novel:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir novela'
    });
  }
});

// POST /api/upload/multiple - Subida múltiple genérica
router.post('/multiple', requireAuth, uploadImage.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se han subido archivos'
      });
    }

    const { folder = 'general', optimize = true } = req.body;

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        let filePath = file.path;

        // Optimizar si se solicita
        if (optimize === 'true') {
          const optimizedPath = filePath.replace(path.extname(filePath), '_optimized.webp');
          filePath = await optimizeImage(filePath, optimizedPath, {
            width: 1200,
            quality: 85,
            format: 'webp'
          });
        }

        const cloudinaryResult = await uploadToCloudinary(filePath, {
          folder: folder,
          public_id: `${folder}_${Date.now()}_${index}`,
          transformation: optimize === 'true' ? [
            { width: 1200, crop: 'scale' },
            { quality: 'auto' }
          ] : undefined
        });

        // Eliminar archivo temporal original
        await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));

        return {
          originalName: file.originalname,
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          size: cloudinaryResult.bytes,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height
        };

      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
        return {
          originalName: file.originalname,
          error: error.message
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.json({
      success: true,
      data: {
        successful: successful,
        failed: failed,
        totalUploaded: successful.length,
        totalFailed: failed.length
      },
      message: `${successful.length} archivos subidos exitosamente${failed.length > 0 ? `, ${failed.length} fallaron` : ''}`
    });

  } catch (error) {
    console.error('Error in multiple upload:', error);
    
    if (req.files) {
      req.files.forEach(async (file) => {
        await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error en subida múltiple'
    });
  }
});

// DELETE /api/upload/:publicId - Eliminar archivo de Cloudinary
router.delete('/:publicId', requireAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    // Verificar que el usuario tiene permisos para eliminar este archivo
    // (implementar lógica de verificación según tu modelo de datos)

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Archivo no encontrado'
      });
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar archivo'
    });
  }
});

// GET /api/upload/status/:uploadId - Verificar estado de subida
router.get('/status/:uploadId', requireAuth, async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Buscar el estado de la subida en base de datos
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Subida no encontrada'
      });
    }

    res.json({
      success: true,
      data: upload
    });

  } catch (error) {
    console.error('Error checking upload status:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar estado de subida'
    });
  }
});

// Middleware para manejar errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Archivo demasiado grande'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos'
      });
    }
  }
  
  if (error.message.includes('Solo se permiten')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({
    success: false,
    error: 'Error en la subida de archivos'
  });
});

module.exports = router;