const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const { supportState, activeThreads } = require('./supportState');
const isSpam = require('./supportSpamCheck');
const forwardMessage = require('./supportForward');

function setupTicketFlow(bot) {
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

  bot.action(/^support_/, async (ctx) => {
    if (activeThreads[ctx.from.id]) {
      return ctx.answerCbQuery('❗ Du hast bereits ein offenes Ticket.', { show_alert: true });
    }

    const topic = ctx.match.input.replace('support_', '');
    supportState[ctx.from.id] = { step: 'waiting_message', topic };

    const texts = {
      vip: '📦 *VIP-Zugang*\n\nBitte sende uns den Chatnachweis mit dem VIP-Bot sowie den Kaufbeleg, den du per E-Mail von CryptoVoucher erhalten hast.',
      payment: '💰 *Payment / Forward Chat*\n\nTelegram hat Gruppen & Zugänge gesperrt. Alle müssen neu kaufen. Neue Links werden regelmäßig im Kanal gepostet.',
      tech: '🛠 *Technisches Problem*\n\nHast du Probleme mit Gruppen oder Beiträgen? Dann schildere es hier.',
      other: '📝 *Sonstiges*\n\nProbleme mit Beiträgen, Admins oder Verdacht auf Fake? Melde dich hier.'
    };

    await ctx.editMessageText(`${texts[topic]}\n\n✍️ *Sende deine Nachricht:*`, {
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
    const state = supportState[userId];
    const text = ctx.message.text || ctx.message.caption || '';

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
        const header = `🆕 *Support-Anfrage*\n👤 [@${username}](tg://user?id=${userId})\n🆔 \`${userId}\`\n📝 Thema: ${niceTopic}\n\n`;

        const sent = await forwardMessage(ctx, null, header); // General-Thread (kein threadId)

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '👮 Admin-Aktion erforderlich:', {
          reply_to_message_id: sent.message_id,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Akzeptieren', `accept_${userId}_${state.topic}`),
              Markup.button.callback('❌ Ablehnen', `deny_${userId}`)
            ]
          ]).reply_markup
        });

        await ctx.reply('✅ Deine Anfrage wurde weitergeleitet. Ein Admin wird sie prüfen.');
      } catch (err) {
        console.error('❌ Fehler beim Senden in General:', err);
        await ctx.reply('⚠️ Fehler beim Senden deiner Nachricht.');
      }

      delete supportState[userId];
      return;
    }

    if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n`;
      await forwardMessage(ctx, threadId, forwardText);
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

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