const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');
const { Markup } = require('telegraf');

function registerSupport(bot) {
  // Schritt 1: /start zeigt Anliegen-Auswahl
  bot.command('start', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.reply('Was ist dein Anliegen?', Markup.inlineKeyboard([
      [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
      [Markup.button.callback('💰 Zahlung / Payment', 'support_payment')],
      [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
      [Markup.button.callback('📝 Sonstiges', 'support_other')],
    ]));
  });

  // Schritt 2: Thema auswählen
  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    await ctx.reply(`Bitte beschreibe dein Anliegen zum Thema: ${topic.toUpperCase()}`);
  });

  // Schritt 3: Nachricht empfangen → Thread erstellen + senden
  bot.on('message', async (ctx) => {
    // FALL A: PRIVATE MESSAGE → TICKET ERSTELLUNG
    if (ctx.chat.type === 'private') {
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
        const topicTitle = `${niceTopic} – @${username}`;
        const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, topicTitle);

        // Nachricht in Thread senden
        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, fullText, {
          parse_mode: 'Markdown',
          message_thread_id: thread.message_thread_id
        });

        // Thread speichern
        activeThreads[thread.message_thread_id] = userId;

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler bei Thread-Erstellung:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen deines Support-Tickets. Bitte versuch es später erneut.');
      }

      delete supportState[ctx.from.id];
    }

    // FALL B: NACHRICHT IM THREAD (Support-Gruppe)
    else if (
      ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString() &&
      ctx.message.message_thread_id &&
      !ctx.from.is_bot
    ) {
      const threadId = ctx.message.message_thread_id;
      const userId = activeThreads[threadId];

      if (!userId) return;

      const sender = ctx.from.username || 'Admin';
      const text = `📩 *Antwort vom Support*\n\n💬 ${ctx.message.text}\n\n👤 Von: ${sender}`;

      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler beim Antworten an User:', err.description || err.message);
      }
    }
  });
}

module.exports = { registerSupport };