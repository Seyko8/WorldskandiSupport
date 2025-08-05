const { Markup } = require('telegraf');
const faqText = require('../content/faqText');

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

  // === FAQ (ausgelagert) ===
  bot.action('menu_faq', async (ctx) => {
    await ctx.editMessageText(faqText, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  // === Wichtige Links (aktualisiert ohne "18+") ===
  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*\n\n' +
      '📸 [Instagram](http://instagram.com/offiziell.worldskandi)\n' +
      '👻 [Snapchat](https://www.snapchat.com/@offiziellwsk)\n\n' +
      '🔞 [Velvet](https://t.me/VelvetGlobal)\n' +
      '🔞 [Skandi](https://t.me/+h_SoVDxZc1lhZjRh)\n' +
      '💾 [Speicher-Kanal](https://t.me/+Be0bO9BWhHk1ZWU0)\n\n' +
      '📥 [In alle Gruppen rein](https://t.me/addlist/ztczKNjf1LNjMzFk)';

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