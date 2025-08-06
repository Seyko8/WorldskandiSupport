function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Du erhältst alle Beiträge aus der Hauptgruppe direkt in einem privaten Kanal.\n\n` +
      `5️⃣ Welche Gruppe öffnet?\n🕒 Wir haben keine festen Öffnungszeiten. 👉 https://t.me/+pgbomQsLFZNlOGZi\n\n` +
      `6️⃣ Welche Gruppen gibt es?\n📋 https://t.me/WorldskandiNavi\n\n` +
      `7️⃣ Wodurch kann ich gebannt werden?\n🚫 Regelwerk gilt für alle – frag Admins.\n\n` +
      `8️⃣ VIP-Zugang verloren?\n🔑 Sende Bot-Verlauf + CryptoVoucher-Mail (Beleg).\n\n` +
      `9️⃣ VIP upgraden?\n⬆️ Ja, Differenz zahlen reicht.\n\n` +
      `🔟 Zahlungsmethoden?\n💳 Crypto-Voucher (z. B. per Karte, PayPal).\n\n` +
      `1️⃣1️⃣ VIP teilen/übertragen?\n🙅‍♂️ Nicht möglich – Account-gebunden.\n\n` +
      `1️⃣2️⃣ Rückerstattung?\n❌ Nein – digitaler Zugang.\n\n` +
      `1️⃣3️⃣ Admin kontaktieren?\n📞 Über Bot → Sonstiges.\n\n` +
      `1️⃣4️⃣ Wie lange dauert’s?\n⏳ Manuelle Bearbeitung – ggf. Wartezeit.\n\n` +
      `1️⃣5️⃣ Admin werden?\n🛡 Durch Aktivität + Vertrauen.\n\n` +
      `1️⃣6️⃣ Entbannt werden?\n🚫 Nach 3 Warnungen → dauerhaft raus.\n\n` +
      `1️⃣7️⃣ Andere VIP-Verkäufe?\n❌ Nein – nur @WSkandiVipBot ist echt.`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === LINKS ===
  bot.action('menu_links', async (ctx) => {
    const text = `🔗 *Wichtige Links:*\n\n` +
      `📸 *Instagram*: [@offiziell.worldskandi](https://instagram.com/offiziell.worldskandi)\n` +
      `👻 *Snapchat*: [@offiziellwsk](https://www.snapchat.com/@offiziellwsk)\n` +
      `🎥 *Velvet*: https://t.me/VelvetGlobal\n` +
      `🔞 *Skandi*: https://t.me/+h_SoVDxZc1lhZjRh\n` +
      `💾 *Speicher*: https://t.me/+Be0bO9BWhHk1ZWU0\n\n` +
      `📋 *Alle Gruppen*: https://t.me/addlist/ztczKNjf1LNjMzFk`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === NEWS ===
  bot.action('menu_news', async (ctx) => {
    await ctx.editMessageText('🆕 Es gibt aktuell keine neuen Ankündigungen.', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === START-MENÜ ===
  bot.action('start', async (ctx) => {
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
            { text: '🛠️ Support', callback_data: 'menu_support' },
            { text: '🆕 News', callback_data: 'menu_news' }
          ]
        ]
      }
    });
  });

  // === BACK FROM SUPPORT ===
  bot.action('menu_back', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.telegram.sendMessage(ctx.chat.id, '/start');
  });
}

module.exports = setupMenu;