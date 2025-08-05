const { Markup } = require('telegraf');

function menuHandler(bot) {
  // === /start zeigt Hauptmenü ===
  bot.command('start', async (ctx) => {
    await showMainMenu(ctx);
  });

  bot.action('menu_back', async (ctx) => {
    await showMainMenu(ctx);
  });

  async function showMainMenu(ctx) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const text = `👋 *Willkommen ${username} beim Worldskandi Support-Bot!*\n\nBitte wähle eine Option:`;

    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('📂 FAQ', 'menu_faq'), Markup.button.callback('🔗 Links', 'menu_links')],
      [Markup.button.callback('🛠 Support', 'menu_support'), Markup.button.callback('🆕 News', 'menu_news')]
    ]);

    if (ctx.updateType === 'callback_query') {
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: buttons.reply_markup
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: buttons.reply_markup
      });
    }
  }

  // === FAQ ===
  bot.action('menu_faq', async (ctx) => {
    const text = '📂 *Häufige Fragen (FAQ)*\n\n' +
      '1️⃣ Wie werde ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n' +
      '2️⃣ Was kostet VIP?\n💸 Einmalig 50€ oder 100€ – kein Abo.\n\n' +
      '3️⃣ Wie bekomme ich Zugang?\n📨 Nach Zahlung bekommst du sofort den Link.';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  // === Links ===
  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*\n\n' +
      '📷 [Instagram](https://instagram.com/worldskandi)\n' +
      '🎥 VIP Bot: @WSkandiVipBot\n' +
      '📩 Support: @WorldskandiNavi';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  // === News ===
  bot.action('menu_news', async (ctx) => {
    const text = '🆕 *Aktuelle Updates:*\n\nWir arbeiten täglich an Verbesserungen. Stay tuned!';
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });
}

module.exports = menuHandler;