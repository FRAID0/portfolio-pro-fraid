const { sendEmail } = require('../services/emailService');

exports.submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis (nom, email, message)." });
  }

  try {
    // 1. Send email to Admin
    await sendEmail({
      to: process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: "Nouveau message depuis le site",
      text: `Nouveau message reçu:\n\nNom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });

    // 2. Send confirmation to User
    await sendEmail({
      to: email,
      subject: "Votre message a bien été reçu",
      text: `Bonjour ${name},\n\nMerci pour votre message.\nNous vous répondrons dans les plus brefs délais.\n\nCordialement,\nL'équipe FRAID`
    });

    res.status(200).json({ message: "Message envoyé avec succès" });
  } catch (error) {
    console.error("Contact Controller Error:", error);
    res.status(500).json({ error: "Impossible d'envoyer le message" });
  }
};

exports.testEmail = async (req, res) => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER || '5667tom@gmail.com',
      subject: "Test email Render",
      text: "Si vous recevez ce message, le SMTP fonctionne."
    });
    res.status(200).json({ message: "Test email envoyé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Échec de l'envoi du test email" });
  }
};
