const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const { Markup } = require('telegraf');

function registerSupport(bot) {
  bot.command('start', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.reply('Was ist dein Anliegen?', Markup.inlineKeyboard([
      [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
      [Markup.button.callback('💰 Zahlung / Payment', 'support_payment')],
      [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
      [Markup.button.callback('📝 Sonstiges', 'support_other')],
    ]));
  });

  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    await ctx.reply(`Bitte beschreibe dein Anliegen zum Thema: ${topic.toUpperCase()}`);
  });

  bot.on('message', async (ctx) => {
    const state = supportState[ctx.from.id];
    if (!state || state.step !== 'waiting_message') return;

    const topicText = {
      vip: '📦 VIP-Zugang',
      payment: '💰 Zahlung / Payment',
      tech: '🛠️ Technisches Problem',
      other: '📝 Sonstiges'
    };

    const message = `🆕 *Support-Ticket*\n` +
      `👤 User: [@${ctx.from.username || 'unbekannt'}](tg://user?id=${ctx.from.id})\n` +
      `📝 Thema: ${topicText[state.topic] || state.topic}\n\n` +
      `💬 Nachricht:\n${ctx.message.text}`;

    await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, message, {
      parse_mode: 'Markdown'
    });

    await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');

    delete supportState[ctx.from.id];
  });
}

module.exports = { registerSupport };