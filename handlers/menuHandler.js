function setupMenu(bot) {
  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 Häufige Fragen (FAQ)\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Beiträge direkt aus der Hauptgruppe im privaten Kanal.\n\n` +
      `5️⃣ Öffnungszeiten?\n🕒 Keine festen Zeiten – Infos: https://t.me/+pgbomQsLFZNlOGZi\n\n` +
      `6️⃣ Gruppenübersicht: https://t.me/WorldskandiNavi`;

    await ctx.editMessageText(text, {
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