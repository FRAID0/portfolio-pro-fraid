const { sendEmail, transporter } = require('../services/emailService');

/**
 * Soumission du formulaire de contact
 * Gère la validation, l'envoi à l'admin et la confirmation à l'utilisateur.
 */
exports.submitContactForm = async (req, res) => {
  console.log("--- Nouvelle requête Contact ---");
  console.log("Body reçu:", JSON.stringify({ ...req.body, email: "********" })); // On masque l'email complet pour les logs

  const { name, email, message } = req.body;

  // 1. Validation des champs
  if (!name || !email || !message) {
    console.warn("Validation échouée: champs manquants.");
    return res.status(400).json({ error: "Tous les champs (nom, email, message) sont obligatoires." });
  }

  // 2. Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn(`Validation échouée: format email invalide (${email}).`);
    return res.status(400).json({ error: "L'adresse email est invalide." });
  }

  // 3. Validation longueur message
  if (message.length < 5) {
    return res.status(400).json({ error: "Le message est trop court." });
  }

  try {
    // Vérification du service email avant de commencer
    console.log("Vérification de la connexion SMTP...");
    await transporter.verify();
    
    // A. Envoi à l'Admin
    console.log(`Envoi du message de ${name} à l'admin...`);
    await sendEmail({
      to: process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: `[PROJET PORTFOLIO] Nouveau message de ${name}`,
      text: `Détails du message:\n\nNom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 15px; background: #f4f4f4; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      `
    });

    // B. Envoi de confirmation à l'Utilisateur
    console.log(`Envoi de la confirmation à ${email}...`);
    await sendEmail({
      to: email,
      subject: "Confirmation de réception - Portfolio FRAID",
      text: `Bonjour ${name},\n\nJ'ai bien reçu votre message et je vous remercie de m'avoir contacté. Je reviendrai vers vous très prochainement.\n\nCordialement,\nFRAID`,
      html: `
        <h3>Bonjour ${name},</h3>
        <p>Merci pour votre message ! Je l'ai bien reçu et je vous répondrai dans les plus brefs délais.</p>
        <p>A bientôt,</p>
        <p><strong>FRAID</strong></p>
      `
    });

    console.log("Flux de contact terminé avec succès.");
    res.status(200).json({ success: true, message: "Message envoyé ! Je vous répondrai bientôt." });

  } catch (error) {
    console.error("ERREUR CRITIQUE CONTACT:", error.message);
    console.error("Stack trace:", error.stack);

    // Détection d'erreurs SMTP spécifiques (Auth, Timeout...)
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: "Erreur d'authentification SMTP. Vérifie ton Mot de passe d'application Gmail." });
    }
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return res.status(500).json({ error: "Le serveur de mail met trop de temps à répondre (Timeout). Réessaie plus tard." });
    }

    res.status(500).json({ error: "Une erreur interne est survenue lors de l'envoi." });
  }
};

/**
 * Route de test SMTP rapide
 */
exports.testEmail = async (req, res) => {
  console.log("Lancement du test email...");
  try {
    await sendEmail({
      to: process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: "🚀 TEST RENDER SMTP",
      text: "Si tu lis ceci, ton backend est correctement configuré pour Gmail."
    });
    res.status(200).json({ success: true, message: "Email de test envoyé !" });
  } catch (error) {
    console.error("Echec du test SMTP:", error);
    res.status(500).json({ error: "SMTP Error: " + error.message });
  }
};
