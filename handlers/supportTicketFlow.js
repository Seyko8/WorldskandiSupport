const { SUPPORT_GROUP_ID } = require('../config');
const { Markup } = require('telegraf');
const { supportState, activeThreads } = require('./supportState');
const isSpam = require('./supportSpamCheck');
const forwardMessage = require('./supportForward');

function setupTicketFlow(bot) {
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'User';
    const state = supportState[userId];
    const text = ctx.message.text || ctx.message.caption || '';

    // Neues Ticket
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
        const header = `🆕 *Support-Anfrage*\n👤 @${username}\n🆔 \`${userId}\`\n📝 Thema: ${niceTopic}`;
        const message = ctx.message;

        // In General posten
        await forwardMessage(ctx, null, header);

        // Admin-Aktion
        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, `👮 *Admin-Aktion erforderlich:*`, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Akzeptieren', `accept_${userId}`),
              Markup.button.callback('❌ Ablehnen', `deny_${userId}`)
            ]
          ])
        });

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler beim Weiterleiten:', err);
        await ctx.reply('⚠️ Fehler beim Senden deiner Anfrage.');
      }

      delete supportState[userId];
      return;
    }

    // Folge-Nachricht vom User (bei aktivem Thread)
    if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\``;
      await forwardMessage(ctx, threadId, forwardText);
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

    // Admin antwortet im Thread
    const isThreadReply = ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString() && ctx.message.message_thread_id;
    if (isThreadReply) {
      const threadId = ctx.message.message_thread_id;
      const userIdFromThread = Object.entries(activeThreads).find(([uid, tid]) => tid === threadId)?.[0];
      if (!userIdFromThread) return;

      if (ctx.message.text) {
        const replyText = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`;
        try {
          await ctx.telegram.sendMessage(userIdFromThread, replyText, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error('❌ Fehler bei Antwort an User:', err.message);
        }
      }
    }
  });
}

module.exports = setupTicketFlow;