const crypto = require('crypto');
const { sendEmail, verifyEmailTransport, getEmailProviderName } = require('../services/emailService');
const prisma = require('../lib/prisma');

function containsLink(text) {
  if (!text) return false;
  const linkRegex = /(https?:\/\/|www\.|<a\s|mailto:)/gi;
  return linkRegex.test(text);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Soumission du formulaire de contact
 * Gère la validation, l'envoi à l'admin et la confirmation à l'utilisateur.
 */
exports.submitContactForm = async (req, res) => {
  const requestId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const provider = getEmailProviderName();

  console.log(`[contact:${requestId}] Nouvelle requête (provider=${provider})`);
  console.log(
    `[contact:${requestId}] Body reçu:`,
    JSON.stringify({ ...req.body, email: '********' })
  ); // On masque l'email complet pour les logs

  const { name, email, message } = req.body || {};
  const safeName = typeof name === 'string' ? name.trim() : '';
  const safeEmail = typeof email === 'string' ? email.trim() : '';
  const safeMessage = typeof message === 'string' ? message.trim() : '';

  // 1) Validation des champs
  if (!safeName || !safeEmail || !safeMessage) {
    console.warn(`[contact:${requestId}] Validation échouée: champs manquants.`);
    return res.status(400).json({ error: 'Tous les champs (nom, email, message) sont obligatoires.' });
  }

  // 2) Validation tailles (évite spam et payloads trop lourds)
  if (safeName.length > 80) return res.status(400).json({ error: 'Le nom est trop long.' });
  if (safeEmail.length > 254) return res.status(400).json({ error: "L'adresse email est invalide." });
  if (safeMessage.length > 2000) return res.status(400).json({ error: 'Le message est trop long.' });

  // 3) Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(safeEmail)) {
    console.warn(`[contact:${requestId}] Validation échouée: format email invalide.`);
    return res.status(400).json({ error: "L'adresse email est invalide." });
  }

  // 4) Validation longueur message
  if (safeMessage.length < 5) return res.status(400).json({ error: 'Le message est trop court.' });

  // 5) Anti-spam: pas de liens
  if (containsLink(safeMessage)) {
    return res.status(400).json({ error: 'Les liens ne sont pas autorisés dans le message.' });
  }

  try {
    const safeNameHtml = escapeHtml(safeName);
    const safeEmailHtml = escapeHtml(safeEmail);
    const safeMessageHtml = escapeHtml(safeMessage).replace(/\n/g, '<br>');

    // 0) Sauvegarde (best-effort) pour l'historique admin
    try {
      await prisma.message.create({
        data: {
          senderName: safeName,
          senderEmail: safeEmail,
          content: safeMessage,
        },
      });
    } catch (dbError) {
      console.warn(
        `[contact:${requestId}] Sauvegarde DB échouée (non bloquant):`,
        dbError && dbError.message ? dbError.message : dbError
      );
    }

    // A) Envoi à l'Admin (bloquant)
    console.log(`[contact:${requestId}] Envoi du message de "${safeName}" à l'admin...`);
    await sendEmail({
      to: process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: `[PORTFOLIO] Nouveau message de ${safeName}`,
      text: `Détails du message:\n\nNom: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}`,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom:</strong> ${safeNameHtml}</p>
        <p><strong>Email:</strong> ${safeEmailHtml}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 15px; background: #f4f4f4; border-radius: 5px;">
          ${safeMessageHtml}
        </div>
      `,
      replyTo: safeEmail,
    });

    // B) Confirmation utilisateur (non bloquant)
    // Si la confirmation échoue, on garde un succès: l'admin a déjà reçu le message.
    if (process.env.CONTACT_SEND_USER_CONFIRMATION !== 'false') {
      try {
        console.log(`[contact:${requestId}] Envoi de la confirmation à l'utilisateur...`);
        await sendEmail({
          to: safeEmail,
          subject: 'Confirmation de réception - Portfolio FRAID',
          text: `Bonjour ${safeName},\n\nJ'ai bien reçu votre message et je vous remercie de m'avoir contacté. Je reviendrai vers vous très prochainement.\n\nCordialement,\nFRAID`,
          html: `
            <h3>Bonjour ${safeName},</h3>
            <p>Merci pour votre message ! Je l'ai bien reçu et je vous répondrai dans les plus brefs délais.</p>
            <p>A bientôt,</p>
            <p><strong>FRAID</strong></p>
          `,
        });
      } catch (confirmationError) {
        console.warn(
          `[contact:${requestId}] Confirmation utilisateur échouée (non bloquant):`,
          confirmationError && confirmationError.message ? confirmationError.message : confirmationError
        );
      }
    }

    console.log(`[contact:${requestId}] Flux de contact terminé avec succès.`);
    return res.status(200).json({ success: true, message: 'Message envoyé ! Je vous répondrai bientôt.' });
  } catch (error) {
    console.error(
      `[contact:${requestId}] ERREUR CRITIQUE CONTACT:`,
      error && error.message ? error.message : error
    );
    if (error && error.stack) console.error(`[contact:${requestId}] Stack trace:`, error.stack);

    // Détection d'erreurs SMTP spécifiques (Auth, Timeout...)
    if (error && error.code === 'EAUTH') {
      return res.status(500).json({
        error: "Erreur d'authentification SMTP. Vérifie ton mot de passe d'application Gmail.",
      });
    }
    if (error && (error.code === 'ETIMEDOUT' || (error.message || '').toLowerCase().includes('timeout'))) {
      return res.status(500).json({
        error: 'Le serveur de mail met trop de temps à répondre (Timeout). Réessaie plus tard.',
      });
    }

    return res.status(500).json({ error: "Une erreur interne est survenue lors de l'envoi." });
  }
};

/**
 * Route de test email rapide
 */
exports.testEmail = async (req, res) => {
  console.log('Lancement du test email...');
  try {
    // Utile pour Render: confirme que le provider email est joignable.
    await verifyEmailTransport();
    await sendEmail({
      to: process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: 'TEST EMAIL BACKEND',
      text: "Si tu lis ceci, ton backend est correctement configuré pour envoyer des emails.",
    });
    return res.status(200).json({ success: true, message: 'Email de test envoyé !' });
  } catch (error) {
    console.error('Echec du test email:', error);
    return res.status(500).json({ error: 'Email Error: ' + (error && error.message ? error.message : String(error)) });
  }
};
