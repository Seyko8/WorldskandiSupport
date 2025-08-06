function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Du erhältst alle Beiträge aus der Hauptgruppe direkt in einem privaten Kanal.\n\n` +
      `5️⃣ Welche Gruppe öffnet?\n🕒 Wir haben keine festen Öffnungszeiten. Halte die Gruppe im Blick – dort bekommst du vor jeder Öffnung eine Nachricht.\n👉 https://t.me/+pgbomQsLFZNlOGZi\n\n` +
      `6️⃣ Welche Gruppen gibt es?\n📋 Eine Übersicht aller Gruppen findest du hier:\n👉 https://t.me/WorldskandiNavi\n\n` +
      `7️⃣ Wodurch kann ich gebannt werden?\n🚫 Das Regelwerk gilt für alle. Frag bei Admins nach dem Regelwerk.\n\n` +
      `8️⃣ Ich habe meinen VIP-Zugang verloren – was tun?\n🔑 Sende uns den Chat-Verlauf + Kaufbeleg (E-Mail) zur Wiederherstellung.\n\n` +
      `9️⃣ Kann ich mein VIP upgraden?\n⬆️ Ja, einfach Differenzbetrag zahlen – Rest wird geregelt.\n\n` +
      `🔟 Welche Zahlungsmethoden gibt es?\n💳 Crypto-Voucher (z. B. mit PayPal oder Karte).\n\n` +
      `1️⃣1️⃣ Kann ich VIP übertragen oder teilen?\n🙅‍♂️ Nein – VIP ist an deinen Account gebunden.\n\n` +
      `1️⃣2️⃣ Bekomme ich eine Rückerstattung?\n💬 Nein – da es sich um digitalen Zugang handelt.\n\n` +
      `1️⃣3️⃣ Wie erreiche ich einen Admin?\n📞 Über den Bot → Sonstiges auswählen und schreiben.\n\n` +
      `1️⃣4️⃣ Wie lange dauert eine Antwort oder Freischaltung?\n⏳ Kann je nach Andrang dauern – bitte Geduld.\n\n` +
      `1️⃣5️⃣ Kann ich Admin werden?\n🛡 Nur durch Aktivität und Engagement in Gruppen.\n\n` +
      `1️⃣6️⃣ Kann ich entbannt werden?\n🚫 Nein – bei 3 Warnungen ist dauerhaft Schluss.\n\n` +
      `1️⃣7️⃣ Gibt es andere Verkäufe von VIP?\n❌ Nein – nur über @WSkandiVipBot ist offiziell.`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });
  });

  // === Links ===
  bot.action('menu_links', async (ctx) => {
    const text = `🔗 *Wichtige Links:*\n\n` +
      `📸 Instagram: https://instagram.com/offiziell.worldskandi\n` +
      `👻 Snapchat: https://www.snapchat.com/@offiziellwsk\n` +
      `🎥 Velvet: https://t.me/VelvetGlobal\n` +
      `🔞 Skandi: https://t.me/+h_SoVDxZc1lhZjRh\n` +
      `💾 Speicher: https://t.me/+Be0bO9BWhHk1ZWU0\n\n` +
      `📋 Beitrittsliste (alle Gruppen): https://t.me/addlist/ztczKNjf1LNjMzFk`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });
  });

  // === News ===
  bot.action('menu_news', async (ctx) => {
    await ctx.editMessageText('🆕 Es gibt aktuell keine neuen Ankündigungen.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });
  });

  // === Support-Zurück Button (fix) ===
  bot.action('menu_back', async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';
    await ctx.editMessageText(`👋 Willkommen @${username} beim *Worldskandi Support-Bot!*\n\nBitte wähle eine Option:`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📂 FAQ', callback_data: 'menu_faq' },
            { text: '🔗 Links', callback_data: 'menu_links' }
          ],
          [
            { text: '🛠️ Support', callback_data: