const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');
const { Markup } = require('telegraf');

function registerSupport(bot) {
  // /start zeigt Buttons
  bot.command('start', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.reply('👋 *Willkommen beim Worldskandi Support-Bot!*\n\nBitte wähle dein Anliegen:', {
  parse_mode: 'Markdown',
  reply_markup: Markup.inlineKeyboard([
    [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
    [Markup.button.callback('💰 Zahlung / Payment', 'support_payment')],
    [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
    [Markup.button.callback('📝 Sonstiges', 'support_other')],
  ])
});

  // Auswahl-Handler
  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    await ctx.reply(`Bitte beschreibe dein Anliegen zum Thema: ${topic.toUpperCase()}`);
  });

  // Haupt-Handler
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;

    // === 1. Neues Ticket vom User ===
    if (ctx.chat.type === 'private' && supportState[userId]?.step === 'waiting_message') {
      const state = supportState[userId];
      const topicText = {
        vip: '📦 VIP-Zugang',
        payment: '💰 Zahlung / Payment',
        tech: '🛠️ Technisches Problem',
        other: '📝 Sonstiges'
      };

      const niceTopic = topicText[state.topic] || state.topic;
      const username = ctx.from.username || 'unbekannt';

      const fullText = `🆕 *Support-Ticket*\n` +
        `👤 User: [@${username}](tg://user?id=${userId})\n` +
        `🆔 Telegram-ID: \`${userId}\`\n` +
        `📝 Thema: ${niceTopic}\n\n` +
        `💬 Nachricht:\n${ctx.message.text}`;

      try {
        const topicTitle = `${niceTopic} – @${username}`;
        const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, topicTitle);

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, fullText, {
          parse_mode: 'Markdown',
          message_thread_id: thread.message_thread_id
        });

        // Verbindung speichern
        activeThreads[userId] = thread.message_thread_id;

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler bei Thread-Erstellung:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen deines Tickets. Bitte versuch es später nochmal.');
      }

      delete supportState[userId];
    }

    // === 2. User antwortet im Bot → Nachricht ins richtige Thread weiterleiten ===
    else if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const username = ctx.from.username || 'unbekannt';

      const forwardText = `📨 *Antwort vom User*\n` +
        `👤 @${username}\n` +
        `🆔 \`${userId}\`\n\n` +
        `💬 ${ctx.message.text}`;

      try {
        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, forwardText, {
          parse_mode: 'Markdown',
          message_thread_id: threadId
        });

        await ctx.reply('✅ Deine Nachricht wurde an den Support gesendet.');
      } catch (err) {
        console.error('❌ Fehler beim Weiterleiten der User-Antwort:', err);
        await ctx.reply('⚠️ Nachricht konnte nicht weitergeleitet werden.');
      }
    }

    // === 3. Admin antwortet im Thread → Bot sendet Antwort an User (anonymisiert) ===
    else if (
      ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString() &&
      ctx.message.message_thread_id &&
      !ctx.from.is_bot
    ) {
      const threadId = ctx.message.message_thread_id;
      const userId = Object.keys(activeThreads).find(uid => activeThreads[uid] == threadId);
      if (!userId) return;

      const text = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`;

      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler beim Antworten an User:', err.description || err.message);
      }
    }
  });
}

module.exports = { registerSupport };