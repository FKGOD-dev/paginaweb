const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de email para MangaVerse
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initialized = false;
  }

  /**
   * Inicializar el servicio de email
   */
  async initialize() {
    try {
      // Configurar transporter
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verificar configuración
      await this.transporter.verify();
      
      // Cargar plantillas
      await this.loadTemplates();
      
      this.initialized = true;
      console.log('Email service initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Cargar plantillas de email
   */
  async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    
    try {
      const templates = {
        welcome: this.getWelcomeTemplate(),
        verification: this.getVerificationTemplate(),
        passwordReset: this.getPasswordResetTemplate(),
        chapterUpdate: this.getChapterUpdateTemplate(),
        notification: this.getNotificationTemplate(),
        weeklyDigest: this.getWeeklyDigestTemplate()
      };

      for (const [name, template] of Object.entries(templates)) {
        this.templates.set(name, template);
      }

    } catch (error) {
      console.warn('Could not load email templates from files, using built-in templates');
      // Usar plantillas integradas si no se pueden cargar archivos
    }
  }

  /**
   * Enviar email
   */
  async sendEmail(to, subject, template, data = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const html = this.renderTemplate(template, data);
      
      const mailOptions = {
        from: `"MangaVerse" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        // Agregar versión texto plano
        text: this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(userEmail, username) {
    const subject = '¡Bienvenido a MangaVerse!';
    const data = {
      username,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      exploreUrl: `${process.env.FRONTEND_URL}/browse`,
      supportEmail: process.env.EMAIL_USER
    };

    return await this.sendEmail(userEmail, subject, 'welcome', data);
  }

  /**
   * Enviar email de verificación
   */
  async sendVerificationEmail(userEmail, username, verificationToken) {
    const subject = 'Verifica tu cuenta en MangaVerse';
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const data = {
      username,
      verificationUrl,
      supportEmail: process.env.EMAIL_USER
    };

    return await this.sendEmail(userEmail, subject, 'verification', data);
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(userEmail, username, resetToken) {
    const subject = 'Recuperar contraseña - MangaVerse';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const data = {
      username,
      resetUrl,
      supportEmail: process.env.EMAIL_USER
    };

    return await this.sendEmail(userEmail, subject, 'passwordReset', data);
  }

  /**
   * Enviar notificación de nuevo capítulo
   */
  async sendChapterUpdateEmail(userEmail, username, manga, chapter) {
    const subject = `Nuevo capítulo de ${manga.title} disponible`;
    const readUrl = `${process.env.FRONTEND_URL}/manga/${manga.id}/read/${chapter.number}`;
    
    const data = {
      username,
      mangaTitle: manga.title,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      mangaCover: manga.cover,
      readUrl,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/notifications/unsubscribe`
    };

    return await this.sendEmail(userEmail, subject, 'chapterUpdate', data);
  }

  /**
   * Enviar email de notificación general
   */
  async sendNotificationEmail(userEmail, username, notification) {
    const subject = notification.title;
    
    const data = {
      username,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl || `${process.env.FRONTEND_URL}/notifications`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/notifications/unsubscribe`
    };

    return await this.sendEmail(userEmail, subject, 'notification', data);
  }

  /**
   * Enviar resumen semanal
   */
  async sendWeeklyDigest(userEmail, username, digestData) {
    const subject = 'Tu resumen semanal de MangaVerse';
    
    const data = {
      username,
      weekStart: digestData.weekStart,
      weekEnd: digestData.weekEnd,
      newChapters: digestData.newChapters || [],
      recommendations: digestData.recommendations || [],
      stats: digestData.stats || {},
      unsubscribeUrl: `${process.env.FRONTEND_URL}/notifications/unsubscribe`
    };

    return await this.sendEmail(userEmail, subject, 'weeklyDigest', data);
  }

  /**
   * Enviar emails en lote
   */
  async sendBulkEmails(recipients, subject, template, data = {}) {
    if (!Array.isArray(recipients)) {
      throw new Error('Recipients must be an array');
    }

    const results = [];
    const batchSize = 10; // Enviar de a 10 para evitar rate limiting

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const personalizedData = { ...data, ...recipient.data };
          const result = await this.sendEmail(recipient.email, subject, template, personalizedData);
          return { email: recipient.email, success: true, messageId: result.messageId };
        } catch (error) {
          return { email: recipient.email, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.value || { success: false, error: r.reason }));

      // Pausa entre lotes
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Renderizar plantilla con datos
   */
  renderTemplate(templateName, data) {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let html = template;

    // Reemplazar variables en la plantilla
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
    }

    return html;
  }

  /**
   * Convertir HTML a texto plano
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Plantilla de bienvenida
   */
  getWelcomeTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a MangaVerse</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 MangaVerse</div>
            <h1>¡Bienvenido, {{username}}!</h1>
        </div>
        
        <h2>¡Tu aventura en el mundo del manga comienza aquí!</h2>
        
        <p>Estamos emocionados de tenerte en nuestra comunidad. MangaVerse es tu destino definitivo para:</p>
        
        <ul>
            <li>📖 Leer miles de mangas, manhwas y manhuas</li>
            <li>⭐ Crear listas personalizadas y calificar series</li>
            <li>💬 Conectar con otros fanáticos del manga</li>
            <li>🔔 Recibir notificaciones de nuevos capítulos</li>
            <li>✍️ Escribir y compartir tus propias historias</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{exploreUrl}}" class="button">Explorar Mangas</a>
            <a href="{{loginUrl}}" class="button">Iniciar Sesión</a>
        </div>
        
        <h3>¿Necesitas ayuda?</h3>
        <p>Si tienes alguna pregunta, no dudes en contactarnos en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        
        <div class="footer">
            <p>¡Gracias por unirte a MangaVerse!</p>
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla de verificación
   */
  getVerificationTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .verify-button { display: inline-block; background: #4CAF50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Verificar Cuenta</h1>
        </div>
        
        <h2>Hola {{username}},</h2>
        
        <p>¡Casi terminamos! Solo necesitas verificar tu dirección de email para activar completamente tu cuenta en MangaVerse.</p>
        
        <div style="text-align: center;">
            <a href="{{verificationUrl}}" class="verify-button">Verificar mi cuenta</a>
        </div>
        
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{verificationUrl}}</p>
        
        <p><strong>Este enlace expira en 24 horas.</strong></p>
        
        <p>Si no creaste una cuenta en MangaVerse, puedes ignorar este email.</p>
        
        <div class="footer">
            <p>¿Necesitas ayuda? Contacta con nosotros en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla de recuperación de contraseña
   */
  getPasswordResetTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .reset-button { display: inline-block; background: #FF9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Recuperar Contraseña</h1>
        </div>
        
        <h2>Hola {{username}},</h2>
        
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MangaVerse.</p>
        
        <div style="text-align: center;">
            <a href="{{resetUrl}}" class="reset-button">Restablecer Contraseña</a>
        </div>
        
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{resetUrl}}</p>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Este enlace expira en 1 hora por seguridad</li>
                <li>Solo puedes usar este enlace una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
            </ul>
        </div>
        
        <p>Si no solicitaste restablecer tu contraseña, tu cuenta sigue siendo segura. Puedes ignorar este email.</p>
        
        <div class="footer">
            <p>¿Necesitas ayuda? Contacta con nosotros en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla de actualización de capítulo
   */
  getChapterUpdateTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo capítulo disponible</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .manga-info { display: flex; gap: 20px; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .manga-cover { width: 100px; height: 150px; object-fit: cover; border-radius: 5px; }
        .read-button { display: inline-block; background: #2196F3; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📖 ¡Nuevo Capítulo!</h1>
        </div>
        
        <h2>¡Hola {{username}}!</h2>
        
        <p>¡Tenemos buenas noticias! Un nuevo capítulo de uno de tus mangas favoritos está disponible:</p>
        
        <div class="manga-info">
            <img src="{{mangaCover}}" alt="{{mangaTitle}}" class="manga-cover">
            <div>
                <h3>{{mangaTitle}}</h3>
                <h4>Capítulo {{chapterNumber}}: {{chapterTitle}}</h4>
                <p>¡No te lo pierdas! Continúa la aventura donde la dejaste.</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="{{readUrl}}" class="read-button">Leer Ahora</a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Si no quieres recibir más notificaciones de nuevos capítulos, puedes <a href="{{unsubscribeUrl}}">gestionar tus notificaciones aquí</a>.</p>
        
        <div class="footer">
            <p>¡Disfruta leyendo en MangaVerse!</p>
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla de notificación general
   */
  getNotificationTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .action-button { display: inline-block; background: #9C27B0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 {{title}}</h1>
        </div>
        
        <h2>Hola {{username}},</h2>
        
        <p>{{message}}</p>
        
        <div style="text-align: center;">
            <a href="{{actionUrl}}" class="action-button">Ver en MangaVerse</a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Si no quieres recibir más notificaciones por email, puedes <a href="{{unsubscribeUrl}}">gestionar tus notificaciones aquí</a>.</p>
        
        <div class="footer">
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla de resumen semanal
   */
  getWeeklyDigestTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu resumen semanal</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF5722 0%, #D84315 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .manga-item { display: flex; gap: 15px; margin: 15px 0; padding: 15px; background: #fff; border-radius: 5px; }
        .manga-cover { width: 60px; height: 80px; object-fit: cover; border-radius: 3px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; background: #fff; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Tu Resumen Semanal</h1>
            <p>{{weekStart}} - {{weekEnd}}</p>
        </div>
        
        <h2>¡Hola {{username}}!</h2>
        
        <p>Aquí tienes un resumen de tu actividad en MangaVerse esta semana:</p>
        
        <div class="stats">
            <div class="stat">
                <h3>{{stats.chaptersRead}}</h3>
                <p>Capítulos leídos</p>
            </div>
            <div class="stat">
                <h3>{{stats.timeSpent}}</h3>
                <p>Tiempo de lectura</p>
            </div>
            <div class="stat">
                <h3>{{stats.newFavorites}}</h3>
                <p>Nuevos favoritos</p>
            </div>
        </div>
        
        <div class="section">
            <h3>📚 Nuevos capítulos esta semana</h3>
            {{#each newChapters}}
            <div class="manga-item">
                <img src="{{cover}}" alt="{{title}}" class="manga-cover">
                <div>
                    <h4>{{title}}</h4>
                    <p>Capítulo {{chapterNumber}}: {{chapterTitle}}</p>
                </div>
            </div>
            {{/each}}
        </div>
        
        <div class="section">
            <h3>⭐ Recomendaciones para ti</h3>
            {{#each recommendations}}
            <div class="manga-item">
                <img src="{{cover}}" alt="{{title}}" class="manga-cover">
                <div>
                    <h4>{{title}}</h4>
                    <p>{{synopsis}}</p>
                    <small>Rating: {{rating}}/10</small>
                </div>
            </div>
            {{/each}}
        </div>
        
        <p style="font-size: 14px; color: #666;">Si no quieres recibir el resumen semanal, puedes <a href="{{unsubscribeUrl}}">gestionar tus notificaciones aquí</a>.</p>
        
        <div class="footer">
            <p>¡Sigue disfrutando de MangaVerse!</p>
            <p>© 2025 MangaVerse. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// Crear instancia singleton
const emailService = new EmailService();

module.exports = emailService;