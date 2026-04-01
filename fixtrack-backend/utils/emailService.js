// utils/emailService.js
/**
 * Service d'envoi d'emails
 * Utilise Nodemailer pour envoyer des emails
 * Configuration via variables d'environnement:
 * - EMAIL_HOST: serveur SMTP
 * - EMAIL_PORT: port SMTP
 * - EMAIL_USER: adresse email
 * - EMAIL_PASS: mot de passe
 * - EMAIL_FROM: adresse d'expédition
 */

const nodemailer = require("nodemailer");

// Configuration du transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true" || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envoie un email de vérification
 * @param {string} email - Email du destinataire
 * @param {string} nom - Nom de l'utilisateur
 * @param {string} token - Token de vérification
 * @param {string} baseUrl - URL de base du frontend (ex: http://localhost:5173)
 */
const sendVerificationEmail = async (email, nom, token, baseUrl) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Vérifiez votre adresse email - Fixtrack",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .content { padding: 30px 20px; }
            .content p { color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; margin: 20px 0; }
            .footer { background: #f9fafb; color: #6b7280; font-size: 12px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 8px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; color: #991b1b; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Vérification d'email</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${nom}</strong>,</p>
              <p>Merci de vous être inscrit sur <strong>Fixtrack</strong>. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.</p>
              <p>Ce lien expire dans <strong>24 heures</strong>.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✓ Vérifier mon email</a>
              </div>
              <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:<br><code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: block; word-break: break-all; margin-top: 8px;">${verificationUrl}</code></p>
              <div class="warning">
                <strong>⚠️ Sécurité:</strong> Si vous n'avez pas créé ce compte, ignorez cet email. Votre email n'a pas pu être utilisé sans votre intervention.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Fixtrack - Gestion des tickets IT</p>
              <p>Cet email a été envoyé à ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Bonjour ${nom},

Merci de vous être inscrit sur Fixtrack. Pour finaliser votre inscription, veuillez vérifier votre adresse email en visitant ce lien:

${verificationUrl}

Ce lien expire dans 24 heures.

Si vous n'avez pas créé ce compte, ignorez cet email.

---
Fixtrack - Gestion des tickets IT
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️  Email de vérification envoyé:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Erreur envoi email vérification:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} nom - Nom de l'utilisateur
 * @param {string} resetLink - Lien de réinitialisation
 */
const sendPasswordResetEmail = async (email, nom, resetLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialiser votre mot de passe - Fixtrack",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .content { padding: 30px 20px; }
            .content p { color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; margin: 20px 0; }
            .footer { background: #f9fafb; color: #6b7280; font-size: 12px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; color: #991b1b; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${nom}</strong>,</p>
              <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
              <p>Ce lien expire dans <strong>1 heure</strong>.</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">🔄 Réinitialiser le mot de passe</a>
              </div>
              <div class="warning">
                <strong>⚠️ Sécurité:</strong> Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Fixtrack - Gestion des tickets IT</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️  Email réinitialisation envoyé:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Erreur envoi email réinitialisation:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un email de notification générique
 * @param {string} email - Email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML
 */
const sendEmail = async (email, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email envoyé à ${email}:`, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Erreur envoi email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
};
