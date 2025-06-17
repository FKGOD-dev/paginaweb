const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Servicio para manejo de imágenes con Cloudinary
 */
class CloudinaryService {
  
  /**
   * Subir imagen a Cloudinary
   * @param {string} filePath - Ruta del archivo local
   * @param {Object} options - Opciones de configuración
   * @returns {Promise<Object>} Resultado de Cloudinary
   */
  static async uploadImage(filePath, options = {}) {
    try {
      const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        folder: 'general'
      };

      const uploadOptions = { ...defaultOptions, ...options };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      // Eliminar archivo temporal después de la subida
      await this.deleteLocalFile(filePath);

      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          folder: result.folder
        }
      };

    } catch (error) {
      // Limpiar archivo temporal en caso de error
      await this.deleteLocalFile(filePath);
      
      console.error('Error uploading to Cloudinary:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
  }

  /**
   * Subir avatar de usuario
   * @param {string} filePath - Ruta del archivo
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  static async uploadAvatar(filePath, userId) {
    const options = {
      folder: 'avatars',
      public_id: `avatar_${userId}_${Date.now()}`,
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      overwrite: true
    };

    return await this.uploadImage(filePath, options);
  }

  /**
   * Subir portada de manga
   * @param {string} filePath - Ruta del archivo
   * @param {number} mangaId - ID del manga
   * @returns {Promise<Object>}
   */
  static async uploadMangaCover(filePath, mangaId) {
    const options = {
      folder: 'manga-covers',
      public_id: `cover_${mangaId}_${Date.now()}`,
      transformation: [
        { width: 800, crop: 'scale' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    return await this.uploadImage(filePath, options);
  }

  /**
   * Subir páginas de manga
   * @param {Array} filePaths - Array de rutas de archivos
   * @param {number} chapterId - ID del capítulo
   * @returns {Promise<Array>}
   */
  static async uploadMangaPages(filePaths, chapterId) {
    try {
      const uploadPromises = filePaths.map(async (filePath, index) => {
        const options = {
          folder: 'manga-pages',
          public_id: `page_${chapterId}_${index + 1}_${Date.now()}`,
          transformation: [
            { width: 1200, crop: 'scale' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        };

        return await this.uploadImage(filePath, options);
      });

      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        data: results.map((result, index) => ({
          ...result.data,
          pageNumber: index + 1
        }))
      };

    } catch (error) {
      console.error('Error uploading manga pages:', error);
      throw new Error(`Error al subir páginas: ${error.message}`);
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   * @param {string} publicId - ID público de la imagen
   * @param {string} resourceType - Tipo de recurso (image, video, raw)
   * @returns {Promise<Object>}
   */
  static async deleteImage(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'Imagen eliminada' : 'Imagen no encontrada'
      };

    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  }

  /**
   * Eliminar múltiples imágenes
   * @param {Array} publicIds - Array de IDs públicos
   * @param {string} resourceType - Tipo de recurso
   * @returns {Promise<Object>}
   */
  static async deleteMultipleImages(publicIds, resourceType = 'image') {
    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType
      });

      const deleted = Object.keys(result.deleted).length;
      const failed = Object.keys(result.not_found || {}).length;

      return {
        success: true,
        data: {
          deleted,
          failed,
          details: result
        }
      };

    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw new Error(`Error al eliminar imágenes: ${error.message}`);
    }
  }

  /**
   * Generar URL transformada
   * @param {string} publicId - ID público de la imagen
   * @param {Object} transformations - Transformaciones a aplicar
   * @returns {string} URL transformada
   */
  static generateTransformedUrl(publicId, transformations = {}) {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        ...transformations
      });
    } catch (error) {
      console.error('Error generating transformed URL:', error);
      return null;
    }
  }

  /**
   * Generar múltiples tamaños de imagen
   * @param {string} publicId - ID público de la imagen
   * @returns {Object} URLs de diferentes tamaños
   */
  static generateResponsiveUrls(publicId) {
    try {
      return {
        thumbnail: this.generateTransformedUrl(publicId, {
          width: 150,
          height: 200,
          crop: 'fill',
          quality: 'auto'
        }),
        small: this.generateTransformedUrl(publicId, {
          width: 300,
          height: 400,
          crop: 'scale',
          quality: 'auto'
        }),
        medium: this.generateTransformedUrl(publicId, {
          width: 600,
          height: 800,
          crop: 'scale',
          quality: 'auto'
        }),
        large: this.generateTransformedUrl(publicId, {
          width: 1200,
          crop: 'scale',
          quality: 'auto'
        }),
        original: this.generateTransformedUrl(publicId, {
          quality: 'auto',
          fetch_format: 'auto'
        })
      };
    } catch (error) {
      console.error('Error generating responsive URLs:', error);
      return {};
    }
  }

  /**
   * Optimizar imagen existente
   * @param {string} publicId - ID público de la imagen
   * @param {Object} optimizations - Optimizaciones a aplicar
   * @returns {Promise<Object>}
   */
  static async optimizeExistingImage(publicId, optimizations = {}) {
    try {
      const defaultOptimizations = {
        quality: 'auto',
        fetch_format: 'auto',
        flags: 'progressive'
      };

      const options = { ...defaultOptimizations, ...optimizations };

      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        eager: [options]
      });

      return {
        success: true,
        data: {
          originalUrl: result.secure_url,
          optimizedUrl: result.eager[0]?.secure_url || result.secure_url,
          savings: this.calculateSavings(result.bytes, result.eager[0]?.bytes)
        }
      };

    } catch (error) {
      console.error('Error optimizing image:', error);
      throw new Error(`Error al optimizar imagen: ${error.message}`);
    }
  }

  /**
   * Obtener información de imagen
   * @param {string} publicId - ID público de la imagen
   * @returns {Promise<Object>}
   */
  static async getImageInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        image_metadata: true,
        colors: true,
        faces: true
      });

      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes,
          created: result.created_at,
          folder: result.folder,
          colors: result.colors,
          faces: result.faces,
          metadata: result.image_metadata
        }
      };

    } catch (error) {
      console.error('Error getting image info:', error);
      throw new Error(`Error al obtener información: ${error.message}`);
    }
  }

  /**
   * Listar imágenes en una carpeta
   * @param {string} folder - Nombre de la carpeta
   * @param {Object} options - Opciones de listado
   * @returns {Promise<Object>}
   */
  static async listImagesInFolder(folder, options = {}) {
    try {
      const defaultOptions = {
        type: 'upload',
        prefix: folder,
        max_results: 100
      };

      const listOptions = { ...defaultOptions, ...options };

      const result = await cloudinary.api.resources(listOptions);

      return {
        success: true,
        data: {
          images: result.resources.map(resource => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            format: resource.format,
            width: resource.width,
            height: resource.height,
            size: resource.bytes,
            created: resource.created_at
          })),
          total: result.total_count,
          hasMore: result.next_cursor !== undefined,
          nextCursor: result.next_cursor
        }
      };

    } catch (error) {
      console.error('Error listing images:', error);
      throw new Error(`Error al listar imágenes: ${error.message}`);
    }
  }

  /**
   * Buscar imágenes por etiquetas
   * @param {Array} tags - Array de etiquetas
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>}
   */
  static async searchImagesByTags(tags, options = {}) {
    try {
      const expression = tags.map(tag => `tag:${tag}`).join(' OR ');

      const result = await cloudinary.search
        .expression(expression)
        .with_field('tags')
        .with_field('context')
        .max_results(options.maxResults || 50)
        .execute();

      return {
        success: true,
        data: {
          images: result.resources,
          total: result.total_count
        }
      };

    } catch (error) {
      console.error('Error searching images by tags:', error);
      throw new Error(`Error al buscar imágenes: ${error.message}`);
    }
  }

  /**
   * Crear archivo de video/GIF desde imágenes
   * @param {Array} publicIds - IDs de las imágenes
   * @param {Object} options - Opciones del video
   * @returns {Promise<Object>}
   */
  static async createVideoFromImages(publicIds, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'video',
        format: 'mp4',
        fps: 24,
        quality: 'auto'
      };

      const videoOptions = { ...defaultOptions, ...options };

      // Crear transformación para el video
      const transformation = [
        { effect: 'loop', delay: options.delay || 100 },
        { quality: videoOptions.quality },
        { format: videoOptions.format }
      ];

      const result = await cloudinary.uploader.multi(publicIds.join('|'), {
        resource_type: 'video',
        transformation: transformation,
        public_id: `video_${Date.now()}`
      });

      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          duration: result.duration,
          size: result.bytes
        }
      };

    } catch (error) {
      console.error('Error creating video from images:', error);
      throw new Error(`Error al crear video: ${error.message}`);
    }
  }

  /**
   * Agregar marca de agua a imagen
   * @param {string} publicId - ID de la imagen
   * @param {string} watermarkText - Texto de la marca de agua
   * @param {Object} options - Opciones de la marca de agua
   * @returns {Promise<Object>}
   */
  static async addWatermark(publicId, watermarkText, options = {}) {
    try {
      const defaultOptions = {
        overlay: {
          text: watermarkText,
          font_family: 'Arial',
          font_size: 20,
          font_weight: 'bold'
        },
        gravity: 'south_east',
        x: 10,
        y: 10,
        opacity: 70
      };

      const watermarkOptions = { ...defaultOptions, ...options };

      const transformedUrl = this.generateTransformedUrl(publicId, {
        transformation: [
          {
            overlay: {
              text: watermarkOptions.overlay.text,
              font_family: watermarkOptions.overlay.font_family,
              font_size: watermarkOptions.overlay.font_size,
              font_weight: watermarkOptions.overlay.font_weight
            },
            gravity: watermarkOptions.gravity,
            x: watermarkOptions.x,
            y: watermarkOptions.y,
            opacity: watermarkOptions.opacity,
            color: watermarkOptions.color || 'white'
          }
        ]
      });

      return {
        success: true,
        data: {
          originalUrl: this.generateTransformedUrl(publicId),
          watermarkedUrl: transformedUrl
        }
      };

    } catch (error) {
      console.error('Error adding watermark:', error);
      throw new Error(`Error al agregar marca de agua: ${error.message}`);
    }
  }

  /**
   * Calcular ahorro de bytes
   * @private
   */
  static calculateSavings(originalBytes, optimizedBytes) {
    if (!optimizedBytes || optimizedBytes >= originalBytes) {
      return { percentage: 0, bytes: 0 };
    }

    const savedBytes = originalBytes - optimizedBytes;
    const percentage = ((savedBytes / originalBytes) * 100).toFixed(2);

    return {
      percentage: parseFloat(percentage),
      bytes: savedBytes,
      originalSize: originalBytes,
      optimizedSize: optimizedBytes
    };
  }

  /**
   * Eliminar archivo local de forma segura
   * @private
   */
  static async deleteLocalFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Fallo silencioso - el archivo podría no existir
      console.warn(`Could not delete local file: ${filePath}`);
    }
  }

  /**
   * Validar configuración de Cloudinary
   * @returns {boolean}
   */
  static validateConfig() {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    
    if (!cloud_name || !api_key || !api_secret) {
      console.error('Cloudinary configuration missing. Please check environment variables.');
      return false;
    }

    return true;
  }

  /**
   * Obtener estadísticas de uso
   * @returns {Promise<Object>}
   */
  static async getUsageStats() {
    try {
      const result = await cloudinary.api.usage();

      return {
        success: true,
        data: {
          plan: result.plan,
          credits: {
            used: result.credits.used,
            limit: result.credits.limit,
            remaining: result.credits.limit - result.credits.used
          },
          bandwidth: {
            used: result.bandwidth.used,
            limit: result.bandwidth.limit,
            remaining: result.bandwidth.limit - result.bandwidth.used
          },
          storage: {
            used: result.storage.used,
            limit: result.storage.limit,
            remaining: result.storage.limit - result.storage.used
          },
          requests: result.requests,
          transformations: result.transformations
        }
      };

    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = CloudinaryService;