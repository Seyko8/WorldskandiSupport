const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const { Markup } = require('telegraf');

function registerSupport(bot) {
  // /start Befehl → Anliegen-Auswahl zeigen
  bot.command('start', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.reply('Was ist dein Anliegen?', Markup.inlineKeyboard([
      [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
      [Markup.button.callback('💰 Zahlung / Payment', 'support_payment')],
      [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
      [Markup.button.callback('📝 Sonstiges', 'support_other')],
    ]));
  });

  // Wenn Button geklickt → Thema merken
  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    await ctx.reply(`Bitte beschreibe dein Anliegen zum Thema: ${topic.toUpperCase()}`);
  });

  // Wenn Nachricht nach Auswahl kommt → neues Thema erstellen + Nachricht posten
  bot.on('message', async (ctx) => {
    const state = supportState[ctx.from.id];
    if (!state || state.step !== 'waiting_message') return;

    const topicText = {
      vip: '📦 VIP-Zugang',
      payment: '💰 Zahlung / Payment',
      tech: '🛠️ Technisches Problem',
      other: '📝 Sonstiges'
    };

    const niceTopic = topicText[state.topic] || state.topic;
    const username = ctx.from.username || 'unbekannt';
    const userId = ctx.from.id;

    const fullText = `🆕 *Support-Ticket*\n` +
      `👤 User: [@${username}](tg://user?id=${userId})\n` +
      `📝 Thema: ${niceTopic}\n\n` +
      `💬 Nachricht:\n${ctx.message.text}`;

    try {
      // 1. Neues Thema (Thread) in Support-Gruppe erstellen
      const topicTitle = `${niceTopic} – @${username}`;
      const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, topicTitle);

      // 2. Nachricht in den Thread posten
      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, fullText, {
        parse_mode: 'Markdown',
        message_thread_id: thread.message_thread_id
      });

      // 3. Dem User Bescheid sagen
      await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
    } catch (err) {
      console.error('❌ Fehler bei Thread-Erstellung:', err);
      await ctx.reply('⚠️ Fehler beim Erstellen deines Support-Tickets. Bitte versuch es später erneut.');
    }

    // Zustand löschen
    delete supportState[ctx.from.id];
  });
}

module.exports = { registerSupport };