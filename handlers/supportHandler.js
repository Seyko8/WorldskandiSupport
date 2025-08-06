const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');
const isSpam = require('../utils/spamFilter');

function supportHandler(bot) {
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
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    const topics = {
      vip: '📦 *VIP-Zugang*\n\n❗ Bitte sende Chatnachweis + Kaufbeleg (E-Mail).',
      payment: '💰 *Payment / Forward Chat*\n\n⚠️ Nach Sperrung gibt’s neuen Link nach 1 Woche.',
      tech: '🛠 *Technisches Problem*\n\nProbleme mit Gruppen oder Beiträgen? Schreib uns.',
      other: '📝 *Sonstiges*\n\nSchreib dein Anliegen hier – keine Öffnungsfragen.'
    };

    await ctx.editMessageText(`${topics[topic] || 'Support'}\n\n✍️ *Sende deine Nachricht:*`, {
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

    const getHeader = (topic) =>
      `🆕 *Support-Ticket*\n👤 [@${username}](tg://user?id=${userId})\n🆔 \`${userId}\`\n📝 Thema: ${topic}\n\n`;

    if (ctx.chat.type === 'private' && supportState[userId]?.step === 'waiting_message') {
      const state = supportState[userId];
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
      const topic = topicMap[state.topic] || state.topic;

      try {
        const title = `${topic} – @${username}`;
        const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, title);
        const threadId = thread.message_thread_id;

        activeThreads[userId] = threadId;

        await forwardMessage(ctx, threadId, getHeader(topic));

        await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '👮 Admin-Aktion erforderlich:', {
          message_thread_id: threadId,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Akzeptieren', `accept_${userId}`),
              Markup.button.callback('❌ Ablehnen', `deny_${userId}`)
            ],
            [
              Markup.button.callback('✅ Ticket abschließen', `close_${userId}`)
            ]
          ]).reply_markup
        });

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Thread-Fehler:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen deines Tickets.');
      }

      delete supportState[userId];
      return;
    }

    else if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      await forwardMessage(ctx, threadId, `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n`);
      return ctx.reply('✅ Nachricht an den Support gesendet.');
    }

    else if (ctx.chat.type === 'private') {
      return ctx.reply('❗ Du hast bereits ein offenes Ticket. Bitte warte auf eine Antwort.');
    }

    if (
      ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString() &&
      ctx.message.message_thread_id &&
      !ctx.from.is_bot
    ) {
      const threadId = ctx.message.message_thread_id;
      const userId = Object.keys(activeThreads).find(uid => activeThreads[uid] == threadId);
      if (!userId) return;

      const text = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text || '🗂️ Datei erhalten'}`;
      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler bei Antwort:', err);
      }
    }
  });

  bot.action(/^accept_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery('Ticket akzeptiert.');
    } catch (err) {
      console.error('❌ Fehler bei Akzeptieren:', err);
    }
  });

  bot.action(/^deny_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      delete activeThreads[userId];
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery('Ticket abgelehnt.');
    } catch (err) {
      console.error('❌ Fehler bei Ablehnen:', err);
    }
  });

  bot.action(/^close_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      delete activeThreads[userId];

      await ctx.telegram.sendMessage(userId, '🎉 Dein Ticket wurde erfolgreich abgeschlossen. Du kannst nun wieder ein neues erstellen.');
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery('Ticket wurde geschlossen ✅');
    } catch (err) {
      console.error('❌ Fehler beim Abschließen:', err);
    }
  });

  async function forwardMessage(ctx, threadId, header) {
    const chatId = SUPPORT_GROUP_ID;
    const caption = header + (ctx.message.caption || ctx.message.text || '');

    if (ctx.message.photo) {
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      return ctx.telegram.sendPhoto(chatId, fileId, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.video) {
      return ctx.telegram.sendVideo(chatId, ctx.message.video.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.voice) {
      return ctx.telegram.sendVoice(chatId, ctx.message.voice.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.document) {
      return ctx.telegram.sendDocument(chatId, ctx.message.document.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.text) {
      return ctx.telegram.sendMessage(chatId, caption, {
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    }
  }
}

module.exports = supportHandler;