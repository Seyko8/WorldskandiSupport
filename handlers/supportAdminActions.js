const { SUPPORT_GROUP_ID } = require('../config');
const { Markup } = require('telegraf');
const { activeThreads } = require('./supportState');

function registerSupportActions(bot) {
  // ✅ Akzeptieren → Thread erstellen
  bot.action(/^accept_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    const username = ctx.update.callback_query?.message?.text?.match(/@(\w+)/)?.[1] || 'User';

    try {
      // Neues Thema erstellen
      const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, `🧾 Support – @${username}`);
      const threadId = thread.message_thread_id;

      // Ticket speichern
      activeThreads[userId] = threadId;

      // User benachrichtigen
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');

      // User-Nachricht (aus General) ins neue Thema weiterleiten
      const originalMessage = ctx.update.callback_query.message.reply_to_message;
      if (originalMessage) {
        const caption = `📩 *Support-Anfrage*\n👤 @${username}\n🆔 \`${userId}\``;
        await ctx.telegram.copyMessage(SUPPORT_GROUP_ID, SUPPORT_GROUP_ID, originalMessage.message_id, {
          message_thread_id: threadId,
          caption,
          parse_mode: 'Markdown'
        });
      }

      // Hinweis + Button im neuen Thread posten
      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, `📨 Ticket von @${username} übernommen.`, {
        message_thread_id: threadId
      });

      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '🛑 Ticket abschließen?', {
        message_thread_id: threadId,
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('✅ Ticket abschließen', `close_${userId}`)]
        ])
      });

      // Buttons in General entfernen
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

      await ctx.answerCbQuery('Ticket akzeptiert.');
    } catch (err) {
      console.error('❌ Fehler beim Thread-Erstellen:', err);
      await ctx.reply('⚠️ Fehler beim Erstellen des Threads.');
    }
  });

  // ❌ Ablehnen
  bot.action(/^deny_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];

    try {
      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery('Ticket abgelehnt.');
    } catch (err) {
      console.error('❌ Fehler beim Ablehnen:', err.message);
    }
  });

  // ✅ Ticket abschließen
  bot.action(/^close_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];

    try {
      await ctx.telegram.sendMessage(userId, '✅ Dein Ticket wurde abgeschlossen.');
      await ctx.answerCbQuery('Ticket abgeschlossen.');
    } catch (err) {
      console.error('❌ Fehler beim Abschließen:', err.message);
    }
  });
}

module.exports = registerSupportActions;