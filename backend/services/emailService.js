const nodemailer = require('nodemailer');

function parseBool(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).toLowerCase() === 'true';
}

function getEmailProviderName() {
  if (process.env.RESEND_API_KEY) return 'resend';
  return 'smtp';
}

function getSmtpTransporter() {
  const user = process.env.EMAIL_USER;
  // Compat: certains déploiements utilisent EMAIL_PASS au lieu de EMAIL_PASSWORD.
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    const error = new Error('Missing EMAIL_USER / EMAIL_PASSWORD environment variables.');
    error.code = 'EENV';
    throw error;
  }

  // Nodemailer "service: gmail" utilise souvent le port 465 (secure). Sur certains hébergeurs, ça timeout.
  // On force une config SMTP explicite (port 587 par défaut) pour être plus compatible.
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);
  const tlsRejectUnauthorized = parseBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true);
  const enableLogger = parseBool(process.env.SMTP_LOGGER, false);
  const enableDebug = parseBool(process.env.SMTP_DEBUG, false);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20000),
    tls: { rejectUnauthorized: tlsRejectUnauthorized },
    debug: enableDebug,
    logger: enableLogger,
  });
}

let cachedTransporter = null;
function getTransporter() {
  if (!cachedTransporter) cachedTransporter = getSmtpTransporter();
  return cachedTransporter;
}

async function sendViaResend(options) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.CONTACT_FROM_EMAIL || process.env.EMAIL_USER;

  if (!apiKey) {
    const error = new Error('Missing RESEND_API_KEY environment variable.');
    error.code = 'EENV';
    throw error;
  }
  if (!from) {
    const error = new Error('Missing RESEND_FROM (or CONTACT_FROM_EMAIL / EMAIL_USER) environment variable.');
    error.code = 'EENV';
    throw error;
  }

  const payload = {
    from,
    to: [options.to],
    subject: options.subject,
    text: options.text,
    html: options.html,
    reply_to: options.replyTo,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (_) {
      bodyText = '';
    }
    const error = new Error(`Resend API error (${response.status}): ${bodyText || response.statusText}`);
    error.code = 'ERESEND';
    throw error;
  }

  return response.json();
}

/**
 * Send an email using either Resend (HTTP) or SMTP (Nodemailer).
 * @param {Object} options - { to, subject, text, html, replyTo }
 */
const sendEmail = async (options) => {
  const fromAddress = process.env.CONTACT_FROM_EMAIL || process.env.EMAIL_USER || 'no-reply@example.com';

  try {
    console.log(`Tentative d'envoi email (provider=${getEmailProviderName()})...`);

    if (process.env.RESEND_API_KEY) {
      const info = await sendViaResend(options);
      console.log('Email envoyé via Resend.');
      return info;
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: `"Portfolio FRAID" <${fromAddress}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès: ' + info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

async function verifyEmailTransport() {
  if (process.env.RESEND_API_KEY) return true;
  const transporter = getTransporter();
  return transporter.verify();
}

module.exports = { sendEmail, verifyEmailTransport, getEmailProviderName };
