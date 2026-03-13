const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '5667tom@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true
  }
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
