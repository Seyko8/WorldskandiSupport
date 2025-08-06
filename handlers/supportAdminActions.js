const { activeThreads } = require('./supportState');
const { SUPPORT_GROUP_ID } = require('../config');

function setupAdminActions(bot) {
  // ✅ Akzeptieren
  bot.action(/^accept_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
      await ctx.editMessageReplyMarkup(); // entfernt Buttons
      await ctx.answerCbQuery('Ticket akzeptiert ✅');
    } catch (err) {
      console.error('❌ Fehler bei Accept:', err.message);
    }
  });

  // ❌ Ablehnen
  bot.action(/^deny_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      delete activeThreads[userId];
      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery('Ticket abgelehnt ❌');
    } catch (err) {
      console.error('❌ Fehler bei Deny:', err.message);
    }
  });

  // ✅ Ticket schließen
  bot.action(/^close_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      delete activeThreads[userId];
      await ctx.telegram.sendMessage(userId, '✅ Dein Ticket wurde abgeschlossen. Du kannst jetzt ein neues eröffnen.');
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery('Ticket geschlossen ✅');
    } catch (err) {
      console.error('❌ Fehler bei Close:', err.message);
    }
  });

  // 📩 Admin antwortet im Thread → Nachricht an User
  bot.on('message', async (ctx) => {
    const chatId = ctx.chat?.id?.toString();
    const threadId = ctx.message?.message_thread_id;

    if (!chatId || !threadId) return;

    if (chatId === SUPPORT_GROUP_ID.toString()) {
      const userId = Object.keys(activeThreads).find(id => activeThreads[id] == threadId);
      if (!userId) return;

      const text = ctx.message.text
        ? `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`
        : '📩 *Antwort vom Worldskandi Team*\n\n📎 Datei empfangen';

      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler beim Weiterleiten:', err.message);
      }
    }
  });
}

module.exports = setupAdminActions;