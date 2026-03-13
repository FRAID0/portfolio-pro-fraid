const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '5667tom@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 15000, // 15 secondes max pour se connecter
  greetingTimeout: 15000,
  socketTimeout: 20000,
  debug: true, // Active les logs détaillés de nodemailer
  logger: true // Affiche les logs dans la console
});

/**
 * Send an email using SMTP
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Portfolio FRAID" <${process.env.EMAIL_USER || '5667tom@gmail.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    console.log("Tentative d'envoi email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

module.exports = { sendEmail, transporter };
