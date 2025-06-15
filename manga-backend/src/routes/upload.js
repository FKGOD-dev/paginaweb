const { z } = require('zod');
const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Schemas de validación
const uploadOptionsSchema = z.object({
  type: z.enum(['avatar', 'banner', 'cover', 'manga_page', 'general']).default('general'),
  quality: z.enum(['low', 'medium', 'high', 'original']).default('medium'),
  resize: z.object({
    width: z.number().int().min(50).max(4000).optional(),
    height: z.number().int().min(50).max(4000).optional(),
    fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).default('cover')
  }).optional()
});

async function uploadRoutes(fastify, options) {
  
  // Configuraciones de upload por tipo
  const uploadConfigs = {
    avatar: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 400, height: 400, fit: 'cover' },
      folder: 'avatars'
    },
    banner: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 1200, height: 400, fit: 'cover' },
      folder: 'banners'
    },
    cover: {
      maxSize: 8 * 1024 * 1024, // 8MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 600, height: 800, fit: 'cover' },
      folder: 'covers'
    },
    manga_page: {
      maxSize: 15 * 1024 * 1024, // 15MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 1400, height: 2000, fit: 'inside' },
      folder: 'manga_pages'
    },
    general: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resize: { width: 1000, height: 1000, fit: 'inside' },
      folder: 'general'
    }
  };
  
  // Helper para validar archivos
  const validateFile = (file, config) => {
    const errors = [];
    
    if (!file) {
      errors.push('Archivo requerido');
      return errors;
    }
    
    // Validar tamaño
    if (file.file && file.file.bytesRead > config.maxSize) {
      errors.push(`Archivo muy grande. Máximo: ${config.maxSize / (1024 * 1024)}MB`);
    }
    
    // Validar tipo MIME
    const allowedMimes = config.allowedFormats.map(format => {
      if (format === 'jpg') return 'image/jpeg';
      return `image/${format}`;
    });
    
    if (file.mimetype && !allowedMimes.includes(file.mimetype)) {
      errors.push(`Formato no permitido. Permitidos: ${config.allowedFormats.join(', ')}`);
    }
    
    return errors;
  };
  
  // Helper para procesar imagen con Sharp
  const processImage = async (buffer, config, customResize = null) => {
    try {
      let sharpInstance = sharp(buffer);
      
      // Obtener metadatos
      const metadata = await sharpInstance.metadata();
      
      // Configurar resize
      const resizeConfig = customResize || config.resize;
      if (resizeConfig) {
        sharpInstance = sharpInstance.resize({
          width: resizeConfig.width,
          height: resizeConfig.height,
          fit: resizeConfig.fit,
          withoutEnlargement: true
        });
      }
      
      // Optimizar según calidad
      const processedBuffer = await sharpInstance
        .jpeg({ quality: 85, progressive: true })
        .png({ quality: 85, compressionLevel: 6 })
        .webp({ quality: 85 })
        .toBuffer();
      
      return {
        buffer: processedBuffer,
        metadata: {
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          originalSize: buffer.length,
          processedSize: processedBuffer.length,
          format: metadata.format
        }
      };
    } catch (error) {
      throw new Error(`Error procesando imagen: ${error.message}`);
    }
  };
  
  // Helper para subir a Cloudinary
  const uploadToCloudinary = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'image',
        folder: options.folder || 'general',
        transformation: options.transformation || [],
        quality: 'auto:good',
        fetch_format: 'auto',
        ...options
      };
      
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new Error(`Error en Cloudinary: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  };
  
  // 📤 UPLOAD ÚNICO
  fastify.post('/single', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Obtener archivo
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({ error: 'No se proporcionó archivo' });
      }
      
      // Parsear opciones del body o query
      const rawOptions = data.fields?.options?.value || request.query.options || '{}';
      let options;
      
      try {
        options = uploadOptionsSchema.parse(
          typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions
        );
      } catch (parseError) {
        options = uploadOptionsSchema.parse({}); // Usar defaults
      }
      
      const config = uploadConfigs[options.type];
      
      // Validar archivo
      const validationErrors = validateFile(data, config);
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Archivo inválido',
          details: validationErrors
        });
      }
      
      // Convertir stream a buffer
      const chunks = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Procesar imagen
      const { buffer: processedBuffer, metadata } = await processImage(
        buffer,
        config,
        options.resize
      );
      
      // Generar nombre único
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}`;
      
      // Subir a Cloudinary
      const cloudinaryResult = await uploadToCloudinary(processedBuffer, {
        folder: `manga_platform/${config.folder}`,
        public_id: fileName,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });
      
      // Crear diferentes URLs con transformaciones
      const urls = {
        original: cloudinaryResult.secure_url,
        thumbnail: cloudinary.url(cloudinaryResult.public_id, {
          width: 150,
          height: 150,
          crop: 'fill',
          quality: 'auto:good'
        }),
        medium: cloudinary.url(cloudinaryResult.public_id, {
          width: 400,
          height: 400,
          crop: 'limit',
          quality: 'auto:good'
        }),
        large: cloudinary.url(cloudinaryResult.public_id, {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto:good'
        })
      };
      
      // Guardar información en base de datos
      const uploadRecord = await fastify.prisma.upload.create({
        data: {
          userId,
          fileName: data.filename || 'unknown',
          originalName: data.filename || 'unknown',
          mimeType: data.mimetype,
          size: buffer.length,
          processedSize: processedBuffer.length,
          type: options.type,
          cloudinaryId: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
          urls: JSON.stringify(urls),
          metadata: JSON.stringify({
            ...metadata,
            cloudinary: {
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              format: cloudinaryResult.format,
              bytes: cloudinaryResult.bytes
            }
          })
        }
      });
      
      reply.send({
        message: 'Archivo subido exitosamente',
        upload: {
          id: uploadRecord.id,
          fileName: uploadRecord.fileName,
          type: uploadRecord.type,
          size: uploadRecord.size,
          processedSize: uploadRecord.processedSize,
          urls,
          metadata: {
            ...metadata,
            compressionRatio: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(1)
          },
          uploadedAt: uploadRecord.createdAt
        }
      });
      
    } catch (error) {
      fastify.log.error('Error en upload:', error);
      
      if (error.message.includes('Cloudinary')) {
        return reply.code(500).send({
          error: 'Error en servicio de imágenes',
          message: 'Intenta nuevamente en unos momentos'
        });
      }
      
      return reply.code(500).send({
        error: 'Error procesando archivo',
        message: error.message
      });
    }
  });
  
  // 📤 UPLOAD MÚLTIPLE
  fastify.post('/multiple', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const maxFiles = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10;
      
      const parts = request.files();
      const files = [];
      let fileCount = 0;
      
      // Recopilar archivos
      for await (const part of parts) {
        if (part.file) {
          fileCount++;
          if (fileCount > maxFiles) {
            return reply.code(400).send({
              error: `Máximo ${maxFiles} archivos por upload`
            });
          }
          files.push(part);
        }
      }
      
      if (files.length === 0) {
        return reply.code(400).send({ error: 'No se proporcionaron archivos' });
      }
      
      const uploads = [];
      const errors = [];
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Usar configuración general por defecto
          const config = uploadConfigs.general;
          
          // Validar archivo
          const validationErrors = validateFile(file, config);
          if (validationErrors.length > 0) {
            errors.push({
              file: file.filename,
              errors: validationErrors
            });
            continue;
          }
          
          // Convertir a buffer
          const chunks = [];
          for await (const chunk of file.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          
          // Procesar imagen
          const { buffer: processedBuffer, metadata } = await processImage(buffer, config);
          
          // Subir a Cloudinary
          const timestamp = Date.now();
          const fileName = `${userId}_${timestamp}_${i}`;
          
          const cloudinaryResult = await uploadToCloudinary(processedBuffer, {
            folder: `manga_platform/${config.folder}`,
            public_id: fileName
          });
          
          // Crear URLs
          const urls = {
            original: cloudinaryResult.secure_url,
            thumbnail: cloudinary.url(cloudinaryResult.public_id, {
              width: 150,
              height: 150,
              crop: 'fill'
            }),
            medium: cloudinary.url(cloudinaryResult.public_id, {
              width: 400,
              height: 400,
              crop: 'limit'
            })
          };
          
          // Guardar en BD
          const uploadRecord = await fastify.prisma.upload.create({
            data: {
              userId,
              fileName: file.filename || `file_${i}`,
              originalName: file.filename || `file_${i}`,
              mimeType: file.mimetype,
              size: buffer.length,
              processedSize: processedBuffer.length,
              type: 'general',
              cloudinaryId: cloudinaryResult.public_id,
              url: cloudinaryResult.secure_url,
              urls: JSON.stringify(urls),
              metadata: JSON.stringify(metadata)
            }
          });
          
          uploads.push({
            id: uploadRecord.id,
            fileName: uploadRecord.fileName,
            urls,
            size: uploadRecord.size,
            processedSize: uploadRecord.processedSize
          });
          
        } catch (fileError) {
          fastify.log.error(`Error procesando archivo ${file.filename}:`, fileError);
          errors.push({
            file: file.filename,
            error: fileError.message
          });
        }
      }
      
      reply.send({
        message: `${uploads.length} archivos subidos exitosamente`,
        uploads,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: files.length,
          successful: uploads.length,
          failed: errors.length
        }
      });
      
    } catch (error) {
      fastify.log.error('Error en upload múltiple:', error);
      reply.code(500).send({
        error: 'Error procesando archivos',
        message: error.message
      });
    }
  });
  
  // 📋 OBTENER MIS UPLOADS
  fastify.get('/my-uploads', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { page = 1, limit = 20, type } = request.query;
      
      const where = { userId };
      if (type) where.type = type;
      
      const [uploads, total] = await Promise.all([
        fastify.prisma.upload.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            fileName: true,
            originalName: true,
            type: true,
            size: true,
            processedSize: true,
            url: true,
            urls: true,
            createdAt: true
          }
        }),
        fastify.prisma.upload.count({ where })
      ]);
      
      const formattedUploads = uploads.map(upload => ({
        ...upload,
        urls: JSON.parse(upload.urls || '{}'),
        sizeFormatted: `${(upload.size / 1024 / 1024).toFixed(2)} MB`,
        compressionRatio: upload.processedSize && upload.size 
          ? `${((upload.size - upload.processedSize) / upload.size * 100).toFixed(1)}%`
          : null
      }));
      
      reply.send({
        uploads: formattedUploads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🗑️ ELIMINAR UPLOAD
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      
      const upload = await fastify.prisma.upload.findUnique({
        where: { id }
      });
      
      if (!upload) {
        return reply.code(404).send({ error: 'Upload no encontrado' });
      }
      
      // Verificar permisos
      if (upload.userId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar este archivo' });
      }
      
      try {
        // Eliminar de Cloudinary
        if (upload.cloudinaryId) {
          await cloudinary.uploader.destroy(upload.cloudinaryId);
        }
      } catch (cloudinaryError) {
        fastify.log.error('Error eliminando de Cloudinary:', cloudinaryError);
        // No fallar si hay error en Cloudinary
      }
      
      // Eliminar de BD
      await fastify.prisma.upload.delete({
        where: { id }
      });
      
      reply.send({ message: 'Archivo eliminado exitosamente' });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 📊 ESTADÍSTICAS DE UPLOADS
  fastify.get('/stats', async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const [
        totalUploads,
        totalSize,
        typeStats,
        recentUploads
      ] = await Promise.all([
        fastify.prisma.upload.count({ where: { userId } }),
        fastify.prisma.upload.aggregate({
          where: { userId },
          _sum: { size: true, processedSize: true }
        }),
        fastify.prisma.upload.groupBy({
          by: ['type'],
          where: { userId },
          _count: true,
          _sum: { size: true }
        }),
        fastify.prisma.upload.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            fileName: true,
            type: true,
            size: true,
            createdAt: true
          }
        })
      ]);
      
      const stats = {
        totals: {
          uploads: totalUploads,
          totalSize: totalSize._sum.size || 0,
          totalProcessedSize: totalSize._sum.processedSize || 0,
          totalSizeFormatted: `${((totalSize._sum.size || 0) / 1024 / 1024).toFixed(2)} MB`,
          savedSpace: totalSize._sum.size && totalSize._sum.processedSize
            ? `${(((totalSize._sum.size - totalSize._sum.processedSize) / 1024 / 1024)).toFixed(2)} MB`
            : '0 MB'
        },
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count,
          totalSize: stat._sum.size || 0,
          totalSizeFormatted: `${((stat._sum.size || 0) / 1024 / 1024).toFixed(2)} MB`
        })),
        recentUploads: recentUploads.map(upload => ({
          ...upload,
          sizeFormatted: `${(upload.size / 1024 / 1024).toFixed(2)} MB`
        }))
      };
      
      reply.send(stats);
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔧 CONFIGURACIÓN DE UPLOAD (Admin)
  fastify.get('/config', async (request, reply) => {
    try {
      const userRole = request.user?.role;
      
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        // Configuración pública básica
        return reply.send({
          maxFileSize: '10MB',
          allowedTypes: ['avatar', 'banner', 'cover', 'general'],
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
        });
      }
      
      // Configuración completa para admins
      reply.send({
        configs: uploadConfigs,
        cloudinary: {
          configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
          cloudName: process.env.CLOUDINARY_CLOUD_NAME
        },
        limits: {
          maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
          maxFilesPerUpload: process.env.MAX_FILES_PER_UPLOAD || 5
        }
      });
      
    } catch (error) {
      throw error;
    }
  });
}

module.exports = uploadRoutes;