const { activeThreads } = require('./supportState');

function setupAdminActions(bot) {
  // ✅ Akzeptieren
  bot.action(/^accept_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
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
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
      await ctx.answerCbQuery('Ticket abgelehnt ❌');
    } catch (err) {
      console.error('❌ Fehler bei Deny:', err.message);
    }
  });

  // ✅ Ticket abschließen
  bot.action(/^close_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      delete activeThreads[userId];
      await ctx.telegram.sendMessage(userId, '✅ Dein Ticket wurde abgeschlossen. Du kannst jetzt ein neues starten.');
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
      await ctx.answerCbQuery('Ticket wurde geschlossen ✅');
    } catch (err) {
      console.error('❌ Fehler bei Close:', err.message);
    }
  });

  // 📨 Admin antwortet im Thread → User bekommt Nachricht
  bot.on('message', async (ctx) => {
    if (
      ctx.chat?.id?.toString() === process.env.SUPPORT_GROUP_ID ||
      ctx.chat?.id?.toString() === require('../config').SUPPORT_GROUP_ID.toString()
    ) {
      const threadId = ctx.message.message_thread_id;
      const userId = Object.keys(activeThreads).find((id) => activeThreads[id] == threadId);
      if (!userId) return;

      const text = ctx.message.text
        ? `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`
        : '📩 *Antwort vom Worldskandi Team*\n\n💬 [Datei erhalten]';

      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler beim Weiterleiten an User:', err.message);
      }
    }
  });
}

module.exports = setupAdminActions;