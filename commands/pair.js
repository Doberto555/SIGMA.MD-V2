// ============================================
//   PLUGIN: .pair — Connexion par code de pairing
//   Compatible: Baileys (WhiskeySockets)
// ============================================

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Vérifie que la commande est utilisée en message privé ou groupe
  const numero = args[0]?.replace(/[^0-9]/g, '');

  if (!numero) {
    return m.reply(
      `╔══════════════════╗\n` +
      `║   📲 *PAIR BOT*   ║\n` +
      `╚══════════════════╝\n\n` +
      `❌ Veuillez fournir un numéro de téléphone.\n\n` +
      `*Usage:* ${usedPrefix}pair <numéro>\n` +
      `*Exemple:* ${usedPrefix}pair 22901234567\n\n` +
      `📌 Entrez le numéro complet avec l'indicatif pays (sans + ni 00)`
    );
  }

  // Validation basique du numéro
  if (numero.length < 10 || numero.length > 15) {
    return m.reply(`❌ Numéro invalide. Assurez-vous d'inclure l'indicatif pays.\nEx: *22901234567*`);
  }

  const jid = numero + '@s.whatsapp.net';

  try {
    // Vérifier si le numéro est enregistré sur WhatsApp
    const [result] = await conn.onWhatsApp(jid);
    if (!result?.exists) {
      return m.reply(`❌ Le numéro *+${numero}* n'est pas enregistré sur WhatsApp.`);
    }

    await m.reply(
      `⏳ Génération du code de pairing pour *+${numero}*...\n` +
      `Veuillez patienter quelques secondes.`
    );

    // Générer le code de pairing via Baileys
    const code = await conn.requestPairingCode(numero);

    if (!code) {
      return m.reply(`❌ Impossible de générer un code de pairing. Réessayez dans quelques instants.`);
    }

    // Formatter le code: XXXX-XXXX
    const codeFormate = code.match(/.{1,4}/g)?.join('-') || code;

    // Envoyer le code en message privé à l'utilisateur qui a demandé
    await conn.sendMessage(m.chat, {
      text:
        `╔══════════════════════╗\n` +
        `║  🔐 *CODE DE PAIRING* ║\n` +
        `╚══════════════════════╝\n\n` +
        `📱 Numéro: *+${numero}*\n` +
        `🔑 Code: *${codeFormate}*\n\n` +
        `📋 *Instructions:*\n` +
        `1️⃣ Ouvrez WhatsApp sur votre téléphone\n` +
        `2️⃣ Allez dans *Paramètres → Appareils connectés*\n` +
        `3️⃣ Appuyez sur *Connecter un appareil*\n` +
        `4️⃣ Choisissez *Connecter avec un numéro de téléphone*\n` +
        `5️⃣ Entrez le code ci-dessus\n\n` +
        `⚠️ Ce code expire dans *60 secondes*.\n` +
        `✅ Une fois connecté, vous pourrez utiliser le bot !`
    }, { quoted: m });

    // Log de la connexion
    console.log(`[PAIR] Code généré pour +${numero}: ${codeFormate}`);

  } catch (error) {
    console.error('[PAIR ERROR]', error);

    // Messages d'erreur personnalisés
    if (error.message?.includes('rate-limit') || error.output?.statusCode === 429) {
      return m.reply(
        `⚠️ *Trop de tentatives !*\n` +
        `Veuillez attendre quelques minutes avant de réessayer.`
      );
    }

    if (error.message?.includes('not-authorized')) {
      return m.reply(
        `❌ Le bot n'est pas autorisé à générer un code de pairing pour ce numéro.\n` +
        `Assurez-vous que le numéro est correct.`
      );
    }

    return m.reply(
      `❌ Une erreur s'est produite: ${error.message || 'Erreur inconnue'}\n` +
      `Réessayez dans quelques instants.`
    );
  }
};

handler.help = ['pair <numéro>'];
handler.tags = ['connexion', 'owner'];
handler.command = /^pair$/i;

// Options du plugin
handler.owner = false;      // Mettre true si seulement le owner peut l'utiliser
handler.admin = false;      // Mettre true si seulement les admins peuvent l'utiliser
handler.group = false;      // false = utilisable partout
handler.private = false;    // false = pas seulement en privé
handler.register = false;   // Pas besoin d'être enregistré

export default handler;