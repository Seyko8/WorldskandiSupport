const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');

function supportHandler(bot) {
  // === Menüpunkt "Support" ===
  bot.action('menu_support', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    const text = '📩 *Support starten*\n\nBitte wähle dein Anliegen:';
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
      [Markup.button.callback('💰 Payment / Forward Chat', 'support_payment')],
      [Markup.button.callback('🛠️ Technisches Problem', 'support_tech')],
      [Markup.button.callback('📝 Sonstiges', 'support_other')],
      [Markup.button.callback('🔙 Zurück', 'menu_back')]
    ]);

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: buttons.reply_markup
    });
    await ctx.answerCbQuery();
  });

  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    const textMap = {
      vip:
        '📦 *VIP-Zugang*\n\n❗ Wenn du deinen VIP-Zugang verloren hast, helfen wir dir hier weiter.\n\n' +
        'Bitte sende:\n1. Chatnachweis mit unserem Bot\n2. Kaufbeleg von CryptoVoucher (per E-Mail)\n\n' +
        '⏳ Warte mindestens 1 Tag, bevor du erneut nachfragst.',
      payment:
        '💰 *Payment / Forward Chat*\n\n⚠️ Telegram hat Zugänge gesperrt – alle müssen neu kaufen.\n\n' +
        '📢 In jedem Payment-Kanal wird nach 1 Woche der neue Link gepostet.',
      tech:
        '🛠 *Technisches Problem*\n\nHast du Probleme mit Beiträgen oder Gruppen?\n' +
        '🚫 Keine „Wann ist Gruppe offen?“-Fragen – schau im FAQ.',
      other:
        '📝 *Sonstiges*\n\nProbleme mit Admins, Beiträgen oder etwas Verdächtigem?\n' +
        '🚫 Keine Öffnungsfragen – führt zum Bann.'
    };

    const selectedText = textMap[topic] || 'Bitte beschreibe dein Anliegen kurz.';

    await ctx.editMessageText(`${selectedText}\n\n✍️ *Sende deine Nachricht:*`, {
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

    const getHeader = (topic) => {
      return `🆕 *Support-Ticket*\n` +
        `👤 User: [@${username}](tg://user?id=${userId})\n` +
        `🆔 Telegram-ID: \`${userId}\`\n` +
        `📝 Thema: ${topic}\n\n`;
    };

    // ✅ Nur 1 Ticket pro User
    if (ctx.chat.type === 'private') {
      if (activeThreads[userId]) {
        return ctx.reply('❗ Du hast bereits ein offenes Ticket. Bitte warte, bis ein Admin antwortet.');
      }

      if (supportState[userId]?.step === 'waiting_message') {
        const state = supportState[userId];
        const topicText = {
          vip: '📦 VIP-Zugang',
          payment: '💰 Payment / Forward Chat',
          tech: '🛠️ Technisches Problem',
          other: '📝 Sonstiges'
        };
        const niceTopic = topicText[state.topic] || state.topic;

        try {
          const topicTitle = `${niceTopic} – @${username}`;
          const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, topicTitle);
          const threadId = thread.message_thread_id;

          await forwardMessage(ctx, threadId, getHeader(niceTopic));
          activeThreads[userId] = threadId;

          await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
        } catch (err) {
          console.error('❌ Fehler bei Thread-Erstellung:', err);
          await ctx.reply('⚠️ Ticket konnte nicht erstellt werden. Versuche es später erneut.');
        }

        delete supportState[userId];
        return;
      }
    }

    // Folge-Nachricht
    if (ctx.chat.type === 'private' && activeThreads[userId]) {
      const threadId = activeThreads[userId];
      const forwardText = `📨 *Antwort vom User*\n👤 @${username}\n🆔 \`${userId}\`\n\n`;

      try {
        await forwardMessage(ctx, threadId, forwardText);
        await ctx.reply('✅ Deine Nachricht wurde an den Support gesendet.');
      } catch (err) {
        console.error('❌ Fehler beim Weiterleiten:', err);
        await ctx.reply('⚠️ Nachricht konnte nicht übermittelt werden.');
      }
    }

    // Antwort vom Admin im Thread → an User weiterleiten
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
        console.error('❌ Fehler beim Antworten an User:', err.description || err.message);
      }
    }
  });

  // 🔁 Nachricht an Thread weiterleiten (mit Medien)
  async function forwardMessage(ctx, threadId, header) {
    const chatId = SUPPORT_GROUP_ID;
    const caption = header + (ctx.message.caption || ctx.message.text || '');

    if (ctx.message.photo) {
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      await ctx.telegram.sendPhoto(chatId, fileId, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.video) {
      await ctx.telegram.sendVideo(chatId, ctx.message.video.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.voice) {
      await ctx.telegram.sendVoice(chatId, ctx.message.voice.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.document) {
      await ctx.telegram.sendDocument(chatId, ctx.message.document.file_id, {
        caption,
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else if (ctx.message.text) {
      await ctx.telegram.sendMessage(chatId, caption, {
        parse_mode: 'Markdown',
        message_thread_id: threadId
      });
    } else {
      await ctx.telegram.sendMessage(chatId, '⚠️ Nicht unterstützter Nachrichtentyp.', {
        message_thread_id: threadId
      });
    }
  }
}

module.exports = supportHandler;