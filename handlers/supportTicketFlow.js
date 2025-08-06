const { SUPPORT_GROUP_ID } = require('../config');
const { Markup } = require('telegraf');
const { supportState, activeThreads } = require('./supportState');
const isSpam = require('./supportSpamCheck');

function setupTicketFlow(bot) {
  // User-Nachricht empfangen
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'unbekannt';
    const state = supportState[userId];
    const text = ctx.message.text || ctx.message.caption || '';

    // === 1. Neues Ticket
    if (ctx.chat.type === 'private' && state?.step === 'waiting_message') {
      if (isSpam(text)) {
        return ctx.reply('⚠️ Bitte stelle eine echte Support-Frage. Kein Spam erlaubt.');
      }

      const topicMap = {
        vip: '📦 VIP-Zugang',
        payment: '💰 Payment / Forward Chat',
        tech: '🛠️ Technisches Problem',
        other: '📝 Sonstiges'
      };
      const niceTopic = topicMap[state.topic] || 'Support';

      try {
        const message = await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, `🆕 *Support-Ticket*\n👤 [@${username}](tg://user?id=${userId})\n🆔 \`${userId}\`\n📝 Thema: ${niceTopic}\n\n💬 ${text}`, {
          parse_mode: 'Markdown'
        });

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '👮 *Aktion erforderlich*', {
          reply_to_message_id: message.message_id,
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Akzeptieren', `accept_${userId}_${message.message_id}`),
              Markup.button.callback('❌ Ablehnen', `deny_${userId}_${message.message_id}`)
            ]
          ])
        });

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
        delete supportState[userId];
      } catch (err) {
        console.error('❌ Fehler beim Ticket:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen des Tickets.');
      }

      return;
    }

    // === 2. Folge-Nachricht vom User
    if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n${text}`;
      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, forwardText, {
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

    // === 3. Admin antwortet im Thread
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString() && ctx.message.message_thread_id) {
      const threadId = ctx.message.message_thread_id;
      const userIdFromThread = Object.entries(activeThreads).find(([uid, tid]) => tid === threadId)?.[0];
      if (!userIdFromThread) return;

      if (ctx.message.text) {
        const replyText = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`;
        await ctx.telegram.sendMessage(userIdFromThread, replyText, {
          parse_mode: 'Markdown'
        });
      }
    }
  });
}

module.exports = setupTicketFlow;