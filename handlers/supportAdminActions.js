const { SUPPORT_GROUP_ID } = require('../config');
const { Markup } = require('telegraf');
const activeThreads = require('./supportState').activeThreads;

function registerSupportActions(bot) {
  // ✅ Akzeptieren → Thread erstellen & Buttons im General entfernen
  bot.action(/^accept_(\d+)(_.*)?$/, async (ctx) => {
    const userId = ctx.match[1];
    const username = ctx.update.callback_query?.message?.text?.match(/@(\w+)/)?.[1] || 'User';

    try {
      // 1. Forum-Thread erstellen
      const thread = await ctx.telegram.createForumTopic(SUPPORT_GROUP_ID, `🧾 Support – @${username}`);
      const threadId = thread.message_thread_id;

      // 2. Speichern
      activeThreads[userId] = threadId;

      // 3. Ursprüngliche Nachricht im General bearbeiten → Buttons löschen
      const msg = ctx.update.callback_query.message;
      await ctx.telegram.editMessageReplyMarkup(
        SUPPORT_GROUP_ID,
        msg.message_id,
        null,
        null // Buttons komplett entfernen
      );

      // 4. Begrüßung im neuen Thread
      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, `📩 Ticket von @${username} übernommen.`, {
        message_thread_id: threadId
      });

      // 5. Abschluss-Button im Thread
      await ctx.telegram.sendMessage(SUPPORT_GROUP_ID, '🛑 Ticket abschließen?', {
        message_thread_id: threadId,
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('✅ Ticket abschließen', `close_${userId}`)]
        ])
      });

      // 6. Nachricht an den User
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');

      await ctx.answerCbQuery('Ticket akzeptiert.');
    } catch (err) {
      console.error('❌ Fehler beim Thread-Erstellen:', err);
      await ctx.answerCbQuery('⚠️ Fehler beim Erstellen des Threads.', { show_alert: true });
    }
  });

  // ❌ Ablehnen
  bot.action(/^deny_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];

    try {
      // Buttons im General entfernen
      const msg = ctx.update.callback_query.message;
      await ctx.telegram.editMessageReplyMarkup(
        SUPPORT_GROUP_ID,
        msg.message_id,
        null,
        null
      );

      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      await ctx.answerCbQuery('Ticket abgelehnt.');
    } catch (err) {
      console.error('❌ Fehler beim Ablehnen:', err.message);
      await ctx.answerCbQuery('⚠️ Fehler beim Ablehnen.', { show_alert: true });
    }
  });

  // ✅ Ticket abschließen
  bot.action(/^close_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];

    try {
      await ctx.telegram.sendMessage(userId, '✅ Dein Ticket wurde abgeschlossen. Du kannst jetzt wieder ein neues Ticket erstellen.');
      await ctx.answerCbQuery('Ticket abgeschlossen.');
    } catch (err) {
      console.error('❌ Fehler beim Abschließen:', err.message);
      await ctx.answerCbQuery('⚠️ Fehler beim Abschließen.', { show_alert: true });
    }
  });
}

module.exports = registerSupportActions;