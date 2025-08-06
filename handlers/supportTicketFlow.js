const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const { supportState, activeThreads } = require('./supportState');
const isSpam = require('./supportSpamCheck');
const forwardMessage = require('./supportForward');

function setupTicketFlow(bot) {
  // === /start zeigt Hauptmenü
  bot.start(async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';

    await ctx.telegram.sendMessage(ctx.chat.id, `👋 Willkommen @${username} beim Worldskandi Support-Bot!\n\nBitte wähle eine Option:`, {
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

  // === Supportmenü (immer erlaubt)
  bot.action('menu_support', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.editMessageText('📩 *Support starten*\n\nBitte wähle dein Anliegen:', {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
        [Markup.button.callback('💰 Payment / Forward Chat', 'support_payment')],
        [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
        [Markup.button.callback('📝 Sonstiges', 'support_other')],
        [Markup.button.callback('🔙 Zurück', 'start')]
      ]).reply_markup
    });

    await ctx.answerCbQuery();
  });

  // === Thema auswählen → blockieren bei offenem Ticket
  bot.action(/^support_/, async (ctx) => {
    if (activeThreads[ctx.from.id]) {
      return ctx.answerCbQuery('❗ Du hast bereits ein offenes Ticket.', { show_alert: true });
    }

    const topic = ctx.match.input.replace('support_', '');
    supportState[ctx.from.id] = { step: 'waiting_message', topic };

    const texts = {
      vip: '📦 *VIP-Zugang*\n\n❗ Bitte sende Chatnachweis + Kaufbeleg (E-Mail).',
      payment: '💰 *Payment / Forward Chat*\n\n⚠️ Nach Sperrung kommt neuer Link in 1 Woche.',
      tech: '🛠 *Technisches Problem*\n\nProbleme mit Gruppen oder Beiträgen? Schreib uns.',
      other: '📝 *Sonstiges*\n\nBitte keine „wann öffnet“-Fragen.'
    };

    await ctx.editMessageText(`${texts[topic]}\n\n✍️ *Sende deine Nachricht:*`, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_support')]
      ]).reply_markup
    });

    await ctx.answerCbQuery();
  });

  // === Nachrichten vom User (neues Ticket oder Follow-up)
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'unbekannt';
    const state = supportState[userId];
    const text = ctx.message.text || ctx.message.caption || '';

    // === Neues Ticket erstellen
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
        const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, `${niceTopic} – @${username}`);
        const threadId = thread.message_thread_id;
        activeThreads[userId] = threadId;

        const header = `🆕 *Support-Ticket*\n👤 [@${username}](tg://user?id=${userId})\n🆔 \`${userId}\`\n📝 Thema: ${niceTopic}\n\n`;
        await forwardMessage(ctx, threadId, header);

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '👮 Admin-Aktion erforderlich:', {
          message_thread_id: threadId,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Akzeptieren', `accept_${userId}`),
              Markup.button.callback('❌ Ablehnen', `deny_${userId}`)
            ]
          ]).reply_markup
        });

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '🛑 Ticket abschließen?', {
          message_thread_id: threadId,
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('✅ Ticket abschließen', `close_${userId}`)]
          ]).reply_markup
        });

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler beim Thread:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen des Tickets.');
      }

      delete supportState[userId];
      return;
    }

    // === Folge-Nachricht vom User (bei offenem Ticket)
    if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n`;
      await forwardMessage(ctx, threadId, forwardText);
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

    // === Admin antwortet im Thread → nur bei Text weiterleiten
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