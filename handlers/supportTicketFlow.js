const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const { activeThreads } = require('./supportState');
const isSpam = require('../utils/spamFilter');
const forwardMessage = require('./supportForward');

function setupTicketFlow(bot, supportState) {
  bot.action('menu_support', async (ctx) => {
    if (activeThreads[ctx.from.id]) {
      return ctx.answerCbQuery('❗ Du hast bereits ein offenes Ticket.', { show_alert: true });
    }

    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.editMessageText('📩 *Support starten*\n\nBitte wähle dein Anliegen:', {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
        [Markup.button.callback('💰 Payment / Forward Chat', 'support_payment')],
        [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
        [Markup.button.callback('📝 Sonstiges', 'support_other')],
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  bot.action(/^support_/, async (ctx) => {
    if (activeThreads[ctx.from.id]) {
      return ctx.answerCbQuery('❗ Du hast bereits ein offenes Ticket.', { show_alert: true });
    }

    const topic = ctx.match.input.replace('support_', '');
    supportState[ctx.from.id] = { step: 'waiting_message', topic };

    const topics = {
      vip: '📦 *VIP-Zugang*\n\n❗ Bitte sende Chatnachweis + Kaufbeleg (E-Mail).',
      payment: '💰 *Payment / Forward Chat*\n\n⚠️ Nach Sperrung gibt’s neuen Link nach 1 Woche.',
      tech: '🛠 *Technisches Problem*\n\nProbleme mit Gruppen oder Beiträgen? Schreib uns.',
      other: '📝 *Sonstiges*\n\nSchreib dein Anliegen hier – keine Öffnungsfragen.'
    };

    await ctx.editMessageText(`${topics[topic]}\n\n✍️ *Sende deine Nachricht:*`, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_support')]
      ]).reply_markup
    });

    await ctx.answerCbQuery();
  });

  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'unbekannt';

    // === Neues Ticket
    if (ctx.chat.type === 'private' && supportState[userId]?.step === 'waiting_message') {
      const text = ctx.message.text?.toLowerCase() || ctx.message.caption?.toLowerCase() || '';
      if (isSpam(text)) {
        return ctx.reply('⚠️ Bitte stelle eine konkrete Support-Anfrage. Fragen wie „wann ist Gruppe offen?“ sind nicht erlaubt.');
      }

      const topicMap = {
        vip: '📦 VIP-Zugang',
        payment: '💰 Payment / Forward Chat',
        tech: '🛠️ Technisches Problem',
        other: '📝 Sonstiges'
      };
      const topic = topicMap[supportState[userId].topic] || 'Support';
      const header = `🆕 *Support-Ticket*\n👤 [@${username}](tg://user?id=${userId})\n🆔 \`${userId}\`\n📝 Thema: ${topic}\n\n`;

      try {
        const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, `${topic} – @${username}`);
        const threadId = thread.message_thread_id;
        activeThreads[userId] = threadId;

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

        // Fester Button sichtbar im Thread
        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '🛑 *Support-Ticket beenden?*', {
          message_thread_id: threadId,
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('✅ Ticket abschließen', `close_${userId}`)]
          ]).reply_markup
        });

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler beim Thread-Erstellen:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen des Tickets.');
      }

      delete supportState[userId];
      return;
    }

    // === Folge-Nachricht vom User
    else if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n`;
      await forwardMessage(ctx, threadId, forwardText);
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

    // === Kein gültiger Status
    else if (ctx.chat.type === 'private') {
      return ctx.reply('❗ Du hast bereits ein offenes Ticket. Bitte warte auf eine Antwort.');
    }
  });
}

module.exports = setupTicketFlow;