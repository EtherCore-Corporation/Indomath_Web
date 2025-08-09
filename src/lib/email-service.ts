import sgMail from '@sendgrid/mail';

// Configurar SendGrid con la API key del entorno
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface WelcomeEmailData {
  email: string;
  tempPassword: string;
  productName: string;
  expiresAt: string;
}

interface PaymentConfirmationData {
  email: string;
  productName: string;
  amount: string;
  transactionId: string;
  purchaseDate: string;
  expiresAt: string;
}

interface EmailTemplate {
  to: string;
  from: {
    email: string;
    name: string;
  };
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'contacto@indomath.es';
  private static readonly FROM_NAME = 'IndoMath';

  /**
   * Envía un email de bienvenida con contraseña temporal
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY no está configurada');
        return false;
      }

      const emailTemplate = this.createWelcomeEmailTemplate(data);
      
      await sgMail.send(emailTemplate);
      
      console.log(`✅ Email de bienvenida enviado a: ${data.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      return false;
    }
  }

  /**
   * Envía un email de confirmación de pago
   */
  static async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY no está configurada');
        return false;
      }

      const emailTemplate = this.createPaymentConfirmationTemplate(data);
      
      await sgMail.send(emailTemplate);
      
      console.log(`✅ Email de confirmación de pago enviado a: ${data.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
  }

  /**
   * Crea el template del email de bienvenida
   */
  private static createWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
    const { email, tempPassword, productName, expiresAt } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a IndoMath!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .password-box {
            background: #fff;
            border: 2px dashed #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
          }
          .password {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            background: #f0f4ff;
            padding: 10px;
            border-radius: 5px;
            letter-spacing: 2px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 ¡Bienvenido a IndoMath!</h1>
          <p>Tu cuenta ha sido creada automáticamente</p>
        </div>
        
        <div class="content">
          <h2>¡Hola!</h2>
          
          <p>Gracias por tu compra de <strong>${productName}</strong>. Hemos creado automáticamente una cuenta para ti para que puedas acceder inmediatamente a tu contenido.</p>
          
          <div class="password-box">
            <h3>🔑 Tu contraseña temporal</h3>
            <div class="password">${tempPassword}</div>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Te recomendamos cambiar esta contraseña temporal por una personalizada una vez que inicies sesión. Puedes hacerlo desde tu perfil.
          </div>
          
          <div style="text-align: center;">
            <a href="https://indomath.es/auth/login" class="button">🚀 Iniciar Sesión</a>
          </div>
          
          <h3>📚 Detalles de tu compra:</h3>
          <ul>
            <li><strong>Producto:</strong> ${productName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Válido hasta:</strong> ${expiresAt}</li>
          </ul>
          
          <h3>💡 Próximos pasos:</h3>
          <ol>
            <li>Haz clic en el botón "Iniciar Sesión" arriba</li>
            <li>Usa tu email y la contraseña temporal proporcionada</li>
            <li>Cambia tu contraseña desde tu perfil</li>
            <li>¡Disfruta de tu contenido!</li>
          </ol>
          
          <p>Si tienes algún problema para acceder a tu cuenta, no dudes en contactarnos respondiendo a este email.</p>
          
          <p>¡Gracias por confiar en IndoMath para tu formación!</p>
        </div>
        
        <div class="footer">
          <p>© 2024 IndoMath - Plataforma de educación matemática</p>
          <p>Este email fue enviado a ${email} porque completaste una compra en nuestra plataforma.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
¡Bienvenido a IndoMath!

Gracias por tu compra de ${productName}. Hemos creado automáticamente una cuenta para ti.

CREDENCIALES DE ACCESO:
Email: ${email}
Contraseña temporal: ${tempPassword}

IMPORTANTE: Te recomendamos cambiar esta contraseña temporal por una personalizada una vez que inicies sesión.

Detalles de tu compra:
- Producto: ${productName}
- Email: ${email}
- Válido hasta: ${expiresAt}

Para iniciar sesión, visita: https://indomath.es/auth/login

Si tienes algún problema, contacta con nosotros respondiendo a este email.

¡Gracias por confiar en IndoMath!

© 2024 IndoMath - Plataforma de educación matemática
    `;

    return {
      to: email,
      from: {
        email: this.FROM_EMAIL,
        name: this.FROM_NAME
      },
      subject: `🎉 ¡Bienvenido a IndoMath! Tu cuenta está lista - ${productName}`,
      html: htmlContent,
      text: textContent
    };
  }

  /**
   * Crea el template del email de confirmación de pago
   */
  private static createPaymentConfirmationTemplate(data: PaymentConfirmationData): EmailTemplate {
    const { email, productName, amount, transactionId, purchaseDate, expiresAt } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pago - IndoMath</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .success-badge {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
          }
          .transaction-details {
            background: #fff;
            border: 1px solid #ddd;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            margin: 15px 0;
          }
          .button {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
          .highlight-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .label {
            font-weight: bold;
            width: 40%;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ ¡Pago Confirmado!</h1>
          <p>Tu compra se ha procesado correctamente</p>
        </div>
        
        <div class="content">
          <div class="success-badge">
            🎉 ¡Gracias por tu compra! Tu pago ha sido procesado exitosamente.
          </div>
          
          <h2>Detalles de tu compra</h2>
          
          <div class="transaction-details">
            <table>
              <tr>
                <td class="label">📦 Producto:</td>
                <td><strong>${productName}</strong></td>
              </tr>
              <tr>
                <td class="label">💰 Monto:</td>
                <td><span class="amount">${amount}</span></td>
              </tr>
              <tr>
                <td class="label">📅 Fecha de compra:</td>
                <td>${purchaseDate}</td>
              </tr>
              <tr>
                <td class="label">🔗 ID de transacción:</td>
                <td><code>${transactionId}</code></td>
              </tr>
              <tr>
                <td class="label">⏰ Válido hasta:</td>
                <td>${expiresAt}</td>
              </tr>
              <tr>
                <td class="label">📧 Email de la cuenta:</td>
                <td>${email}</td>
              </tr>
            </table>
          </div>
          
          <div class="highlight-box">
            <strong>🚀 ¿Qué sigue ahora?</strong><br/>
            Ya tienes acceso completo a todo el contenido del curso. Puedes empezar a estudiar inmediatamente.
          </div>
          
          <div style="text-align: center;">
            <a href="https://indomath.es/cursos" class="button">📚 Acceder a mis Cursos</a>
          </div>
          
          <h3>📋 Información importante:</h3>
          <ul>
            <li><strong>Acceso inmediato:</strong> Ya puedes acceder a todo el contenido</li>
            <li><strong>Duración:</strong> Tu acceso es válido hasta ${expiresAt}</li>
            <li><strong>Soporte:</strong> Contactanos en cualquier momento</li>
            <li><strong>Recibo:</strong> Guarda este email como comprobante de compra</li>
          </ul>
          
          <div class="highlight-box">
            💡 <strong>Consejo:</strong> Te recomendamos seguir el orden de las lecciones para un mejor aprovechamiento del curso.
          </div>
          
          <h3>🤝 ¿Necesitas ayuda?</h3>
          <p>Si tienes alguna pregunta sobre tu compra o necesitas ayuda para acceder al contenido, no dudes en contactarnos respondiendo a este email.</p>
          
          <p>¡Esperamos que disfrutes mucho del curso y que sea de gran ayuda para tu formación!</p>
          
          <p><strong>El equipo de IndoMath</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 IndoMath - Plataforma de educación matemática</p>
          <p>Este email de confirmación fue enviado a ${email}</p>
          <p>Conserva este email como comprobante de tu compra</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Confirmación de Pago - IndoMath

¡Pago Confirmado!
Tu compra se ha procesado correctamente.

DETALLES DE TU COMPRA:
- Producto: ${productName}
- Monto: ${amount}
- Fecha de compra: ${purchaseDate}
- ID de transacción: ${transactionId}
- Válido hasta: ${expiresAt}
- Email de la cuenta: ${email}

¿Qué sigue ahora?
Ya tienes acceso completo a todo el contenido del curso. Puedes empezar a estudiar inmediatamente.

Para acceder a tus cursos, visita: https://indomath.es/cursos

Información importante:
- Acceso inmediato: Ya puedes acceder a todo el contenido
- Duración: Tu acceso es válido hasta ${expiresAt}
- Soporte: Contactanos en cualquier momento
- Recibo: Guarda este email como comprobante de compra

Si tienes alguna pregunta, contacta con nosotros respondiendo a este email.

¡Gracias por confiar en IndoMath!

© 2024 IndoMath - Plataforma de educación matemática
    `;

    return {
      to: email,
      from: {
        email: this.FROM_EMAIL,
        name: this.FROM_NAME
      },
      subject: `✅ Confirmación de Pago - ${productName} - IndoMath`,
      html: htmlContent,
      text: textContent
    };
  }

  /**
   * Envía un email de recuperación de contraseña
   */
  static async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY no está configurada');
        return false;
      }

      const emailTemplate: EmailTemplate = {
        to: email,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME
        },
        subject: '🔐 Restablece tu contraseña - IndoMath',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🔐 Restablece tu contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en IndoMath.</p>
            <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
            <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              Restablecer Contraseña
            </a>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          </div>
        `,
        text: `
Restablece tu contraseña

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en IndoMath.

Visita el siguiente enlace para establecer una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email.
        `
      };

      await sgMail.send(emailTemplate);
      console.log(`✅ Email de restablecimiento enviado a: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de restablecimiento:', error);
      return false;
    }
  }
}

export default EmailService;
