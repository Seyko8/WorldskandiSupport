function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Beiträge direkt aus der Hauptgruppe im privaten Kanal.\n\n` +
      `5️⃣ Öffnungszeiten?\n🕒 Keine festen Zeiten – Infos hier: https://t.me/+pgbomQsLFZNlOGZi\n\n` +
      `6️⃣ Gruppenübersicht?\n📋 https://t.me/WorldskandiNavi`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === LINKS (FIXED) ===
  bot.action('menu_links', async (ctx) => {
    const text = `🔗 *Wichtige Links:*\n\n` +
      `📸 Instagram: https://instagram.com/offiziell.worldskandi\n` +
      `👻 Snapchat: https://www.snapchat.com/@offiziellwsk\n` +
      `🎥 Velvet: https://t.me/VelvetGlobal\n` +
      `🔞 Skandi: https://t.me/+h_SoVDxZc1lhZjRh\n` +
      `💾 Speicher: https://t.me/+Be0bO9BWhHk1ZWU0\n\n` +
      `📋 Beitrittsliste: https://t.me/addlist/ztczKNjf1LNjMzFk`;

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
    await ctx.editMessageText('🆕 Aktuell gibt es keine neuen Ankündigungen.', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === ZURÜCK INS HAUPTMENÜ ===
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
}

module.exports = setupMenu;