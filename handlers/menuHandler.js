const { Markup } = require('telegraf');

function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Du erhältst alle Beiträge aus der Hauptgruppe direkt in einem privaten Kanal.\n\n` +
      `5️⃣ Welche Gruppe öffnet?\n🕒 Wir haben keine festen „Öffnungszeiten“. Halte die Gruppe [im Blick](https://t.me/+PaDv9IeSOSw3Njgy) – dort bekommst du vor jeder Öffnung eine Nachricht.\n\n` +
      `6️⃣ Welche Gruppen gibt es?\n📋 Eine Übersicht aller Gruppen findest du [hier](https://t.me/Worldskandinavi)\n\n` +
      `7️⃣ Wodurch kann ich gebannt werden?\n🚫 Das Regelwerk gilt für alle User und Admins. Für einen klaren Überblick bitte einen Admin nach dem Regelwerk fragen.\n\n` +
      `8️⃣ Ich habe meinen VIP-Zugang verloren – was tun?\n🔑 Sende uns den Chat-Verlauf mit unserem Bot und den Kaufbeleg von der Crypto-Voucher-Webseite (per E-Mail erhalten), damit wir den Zugang wiederherstellen können.\n\n` +
      `9️⃣ Kann ich mein VIP upgraden?\n⬆️ Ja, einfach den Differenzbetrag bezahlen – den Rest regeln wir.\n\n` +
      `🔟 Welche Zahlungsmethoden gibt es?\n💳 Crypto-Voucher (mit PayPal, Karte etc. auf der Website).\n\n` +
      `1️⃣1️⃣ Kann ich VIP übertragen oder teilen?\n🙅‍♂️ Nein – VIP ist an deinen Account gebunden.\n\n` +
      `1️⃣2️⃣ Bekomme ich eine Rückerstattung?\n💬 Nein, da es sich um einen digitalen Zugang handelt.\n\n` +
      `1️⃣3️⃣ Wie erreiche ich einen Admin?\n📞 Über „Sonstiges“ kannst du dein Anliegen einreichen.\n\n` +
      `1️⃣4️⃣ Wie lange dauert eine Antwort?\n⏳ Je nach Andrang – bitte geduldig sein.\n\n` +
      `1️⃣5️⃣ Kann ich Admin werden?\n🛡 Nur durch Aktivität & Vertrauen.\n\n` +
      `1️⃣6️⃣ Kann ich entbannt werden?\n🚫 Nach 3 Warnungen folgt dauerhafter Bann.\n\n` +
      `1️⃣7️⃣ Gibt es andere Verkäufe von VIP?\n❌ Nein – nur @WSkandiVipBot ist offiziell.`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'start')]
      ])
    });
  });

  // === LINKS ===
  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*';
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.url('📸 Instagram', 'https://instagram.com/offiziell.worldskandi')],
        [Markup.button.url('👻 Snapchat', 'https://www.snapchat.com/@offiziellwsk')],
        [Markup.button.url('🎥 Velvet', 'https://t.me/VelvetGlobal')],
        [Markup.button.url('🔞 Skandi', 'https://t.me/+h_SoVDxZc1lhZjRh')],
        [Markup.button.url('💾 Speicher-Kanal', 'https://t.me/+Be0bO9BWhHk1ZWU0')],
        [Markup.button.url('✉️ In alle Gruppen rein', 'https://t.me/addlist/ztczKNjf1LNjMzFk')],
        [Markup.button.callback('🔙 Zurück', 'start')]
      ])
    });
  });

  // === NEWS ===
  bot.action('menu_news', async (ctx) => {
    await ctx.editMessageText('🆕 Es gibt aktuell keine neuen Ankündigungen.', {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'start')]
      ])
    });
  });

  // === START-MENÜ ===
  bot.action('start', async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';

    await ctx.editMessageText(`👋 Willkommen @${username} beim Worldskandi Support-Bot!\n\nBitte wähle eine Option:`, {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('📂 FAQ', 'menu_faq'),
          Markup.button.callback('🔗 Links', 'menu_links')
        ],
        [
          Markup.button.callback('🛠️ Support', 'menu_support'),
          Markup.button.callback('🆕 News', 'menu_news')
        ]
      ])
    });
  });
}

module.exports = setupMenu;