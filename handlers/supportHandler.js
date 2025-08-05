const { SUPPORT_GROUP_ID } = require('../config');
const supportState = require('../state/supportState');
const activeThreads = require('../state/activeThreads');
const { Markup } = require('telegraf');

function registerSupport(bot) {
  // === Hauptmenü ===
  bot.command('start', async (ctx) => {
    await showMainMenu(ctx);
  });

  async function showMainMenu(ctx) {
    const text = '👋 *Willkommen beim Worldskandi Support-Bot!*\n\nBitte wähle eine Option:';
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('📂 FAQ', 'menu_faq'), Markup.button.callback('🔗 Links', 'menu_links')],
      [Markup.button.callback('🛠 Support', 'menu_support'), Markup.button.callback('🆕 News', 'menu_news')]
    ]);

    if (ctx.updateType === 'callback_query') {
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: buttons.reply_markup
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: buttons.reply_markup
      });
    }
  }

  // === Menüaktionen ===
  bot.action('menu_faq', async (ctx) => {
    const text = '📂 *Häufige Fragen (FAQ)*\n\n' +
      '1️⃣ Wie werde ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n' +
      '2️⃣ Was kostet VIP?\n💸 Einmalig 50€ oder 100€ – kein Abo.\n\n' +
      '3️⃣ Wie bekomme ich Zugang?\n📨 Nach Zahlung bekommst du sofort den Link.';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*\n\n' +
      '📷 [Instagram](https://instagram.com/worldskandi)\n' +
      '🎥 VIP Bot: @WSkandiVipBot\n' +
      '📩 Support: @WorldskandiNavi';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  bot.action('menu_news', async (ctx) => {
    const text = '🆕 *Aktuelle Updates:*\n\nWir arbeiten täglich an Verbesserungen. Stay tuned!';
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Zurück', 'menu_back')]
      ]).reply_markup
    });
    await ctx.answerCbQuery();
  });

  bot.action('menu_back', async (ctx) => {
    await showMainMenu(ctx);
  });

  // === Support-Flow starten ===
  bot.action('menu_support', async (ctx) => {
    const userId = ctx.from.id;
    supportState[userId] = { step: 'choose_topic' };

    const text = '📩 *Support starten*\n\nBitte wähle dein Anliegen:';
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('📦 VIP-Zugang', 'support_vip')],
      [Markup.button.callback('💰 Zahlung / Payment', 'support_payment')],
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

    await ctx.reply(`Bitte beschreibe dein Anliegen zum Thema: ${topic.toUpperCase()}`);
    await ctx.answerCbQuery();
  });

  // === Nachricht-Handling ===
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;

    // === Neues Ticket ===
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

        activeThreads[userId] = thread.message_thread_id;

        await ctx.reply('✅ Dein Anliegen wurde weitergeleitet. Ein Admin meldet sich bald.');
      } catch (err) {
        console.error('❌ Fehler bei Thread-Erstellung:', err);
        await ctx.reply('⚠️ Fehler beim Erstellen deines Tickets. Bitte versuch es später nochmal.');
      }

      delete supportState[userId];
    }

    // === Antwort vom User → zurück in Thread ===
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

    // === Antwort vom Admin → zurück an User ===
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