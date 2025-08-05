const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');

function supportHandler(bot) {
  // === Menüpunkt "Support" ===
  bot.action('menu_support', async (ctx) => {
    const userId = ctx.from.id;
    supportState[userId] = { step: 'choose_topic' };

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

  // === Kategorie-Auswahl
  bot.action(/^support_/, async (ctx) => {
    const topic = ctx.match.input.replace('support_', '');
    const userId = ctx.from.id;

    supportState[userId] = {
      step: 'waiting_message',
      topic: topic
    };

    const textMap = {
      vip:
        '📦 *VIP-Zugang*\n\n' +
        '❗ Wenn du deinen VIP-Zugang verloren hast, helfen wir dir hier weiter.\n\n' +
        'Bitte sende:\n' +
        '1. Chatnachweis mit unserem Bot\n' +
        '2. Deinen Kaufbeleg von CryptoVoucher (per E-Mail)\n\n' +
        '⏳ Warte mindestens 1 Tag, bevor du erneut nachfragst.',
      payment:
        '💰 *Payment / Forward Chat*\n\n' +
        '⚠️ Telegram hat Zugänge gesperrt – alle müssen neu kaufen.\n\n' +
        '💡 Neue Taktik: Auch nach Sperrung bekommst du wieder Zugang.\n' +
        '📢 In jedem Payment-Kanal wird nach 1 Woche der neue Link gepostet.',
      tech:
        '🛠 *Technisches Problem*\n\n' +
        'Hast du Probleme Beiträge zu sehen oder Gruppen zu öffnen?\n\n' +
        'Schilder dein Problem hier.\n' +
        '🚫 Bitte keine „Wann ist Gruppe offen?“-Fragen. → Schau im FAQ.',
      other:
        '📝 *Sonstiges*\n\n' +
        'Probleme mit Admins, Beiträgen oder Verdacht auf etwas Ungewöhnliches?\n\n' +
        'Schreib es uns hier kurz.\n' +
        '🚫 Keine Fragen zur Öffnung der Gruppe – das führt zum Bann.'
    };

    const selectedText = textMap[topic] || 'Bitte beschreibe dein Anliegen kurz.';

    await ctx.replyWithMarkdown(`${selectedText}\n\n✍️ *Sende deine Nachricht:*`);
    await ctx.answerCbQuery();
  });

  // === Nachricht vom User → Thread erstellen oder weiterleiten
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;

    // Neues Ticket
    if (ctx.chat.type === 'private' && supportState[userId]?.step === 'waiting_message') {
      const state = supportState[userId];
      const topicText = {
        vip: '📦 VIP-Zugang',
        payment: '💰 Payment / Forward Chat',
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

        activeThreads[userId] = thread.message_thread_id;

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler bei Thread-Erstellung:', err);
        await ctx.reply('⚠️ Ticket konnte nicht erstellt werden. Versuche es später erneut.');
      }

      delete supportState[userId];
    }

    // Antwort vom User → in bestehendes Ticket
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
        console.error('❌ Fehler beim Weiterleiten:', err);
        await ctx.reply('⚠️ Nachricht konnte nicht übermittelt werden.');
      }
    }

    // Admin antwortet im Thread → Antwort an User
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

module.exports = supportHandler;