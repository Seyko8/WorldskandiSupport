function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
  const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
    `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
    `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
    `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
    `4️⃣ Was bringt mir der Forward-Chat?\n📡 Du erhältst alle Beiträge aus der Hauptgruppe direkt in einem privaten Kanal.\n\n` +
    `5️⃣ Welche Gruppe öffnet?\n🕒 Wir haben keine festen „Öffnungszeiten“. Halte die Gruppe im Blick – dort bekommst du vor jeder Öffnung eine Nachricht.\n\n` +
    `6️⃣ Welche Gruppen gibt es?\n📋 Eine Übersicht aller Gruppen findest du [hier](https://t.me/Worldskandinavi)\n\n` +
    `7️⃣ Wodurch kann ich gebannt werden?\n🚫 Das Regelwerk gilt für alle User und Admins. Für einen klaren Überblick bitte einen Admin nach dem Regelwerk fragen.\n\n` +
    `8️⃣ Ich habe meinen VIP-Zugang verloren – was tun?\n🔑 Sende uns den Chat-Verlauf mit unserem Bot und den Kaufbeleg von der Crypto-Voucher-Webseite (per E-Mail erhalten), damit wir den Zugang wiederherstellen können.\n\n` +
    `9️⃣ Kann ich mein VIP upgraden?\n⬆️ Ja, einfach den Differenzbetrag bezahlen – den Rest regelt Wir.\n\n` +
    `🔟 Welche Zahlungsmethoden gibt es?\n💳 Crypto-Voucher (mit verschiedenen Zahlungsarten auf der Website wie PayPal, Karte, etc.).\n\n` +
    `1️⃣1️⃣ Kann ich VIP übertragen oder teilen?\n🙅‍♂️ Nein – VIP ist an deinen Account gebunden.\n\n` +
    `1️⃣2️⃣ Bekomme ich eine Rückerstattung?\n💬 Nein, da es sich um einen digitalen Zugang handelt.\n\n` +
    `1️⃣3️⃣ Wie erreiche ich einen Admin?\n📞 Du kannst ganz einfach bei Problemen uns schreiben – über *Sonstiges* sehen wir deine Nachricht.\n\n` +
    `1️⃣4️⃣ Wie lange dauert es, bis ich eine Antwort bekomme oder reinkomme?\n⏳ Jede Anfrage wird manuell bearbeitet. Bei hohem Andrang kann es zu Wartezeiten kommen.\n\n` +
    `1️⃣5️⃣ Kann ich Admin werden?\n🛡 Nicht jeder wird direkt Admin. Du musst dich erst durch Aktivität und Engagement in den Gruppen beweisen.\n\n` +
    `1️⃣6️⃣ Kann ich entbannt werden?\n🚫 Nein. Vor einem Bann gibt es 3 Warnungen. Wenn du dich danach nicht beherrschst, bist du dauerhaft raus.\n\n` +
    `1️⃣7️⃣ Gibt es andere Verkäufe von VIP?\n❌ Nein – der einzige offizielle Verkauf läuft über @WSkandiVipBot`;

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
    }
  });
});

  // === LINKS (mit Buttons!)
  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📸 Instagram', url: 'https://instagram.com/offiziell.worldskandi' }],
          [{ text: '👻 Snapchat', url: 'https://www.snapchat.com/@offiziellwsk' }],
          [{ text: '🎥 Velvet', url: 'https://t.me/VelvetGlobal' }],
          [{ text: '🔞 Skandi', url: 'https://t.me/+h_SoVDxZc1lhZjRh' }],
          [{ text: '💾 Speicher-Kanal', url: 'https://t.me/+Be0bO9BWhHk1ZWU0' }],
          [{ text: '✉️ In alle Gruppen rein', url: 'https://t.me/addlist/ztczKNjf1LNjMzFk' }],
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });
  });

  // === NEWS (optional)
  bot.action('menu_news', async (ctx) => {
    await ctx.editMessageText('🆕 Es gibt aktuell keine neuen Ankündigungen.', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === START-MENÜ
  bot.action('start', async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';

    await ctx.editMessageText(`👋 Willkommen @${username} beim Worldskandi Support-Bot!\n\nBitte wähle eine Option:`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📂 FAQ', callback_data: 'menu_faq' },
            { text: '🔗 Links', callback_data: 'menu_links' }
          ],
          [
            { text: '🛠️ Support', callback_data: 'menu_support' },
            { text: '🆕 News', callback_data: 'menu_news' }
          ]
        ]
      }
    });
  });
}

module.exports = setupMenu;