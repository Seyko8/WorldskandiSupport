const { activeThreads } = require('./supportState');

function setupAdminActions(bot, supportState) {
  // === ✅ Ticket akzeptieren
  bot.action(/^accept_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
      await ctx.answerCbQuery('Ticket akzeptiert.');
    } catch (err) {
      console.error('❌ Fehler bei Akzeptieren:', err);
    }
  });

  // === ❌ Ticket ablehnen
  bot.action(/^deny_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      delete activeThreads[userId];
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
      await ctx.answerCbQuery('Ticket abgelehnt.');
    } catch (err) {
      console.error('❌ Fehler bei Ablehnen:', err);
    }
  });

  // === ✅ Ticket abschließen
  bot.action(/^close_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    try {
      delete activeThreads[userId];

      await ctx.telegram.sendMessage(userId, '🎉 Dein Ticket wurde erfolgreich abgeschlossen. Du kannst nun wieder ein neues erstellen.');
      await ctx.editMessageReplyMarkup(); // Buttons entfernen
      await ctx.answerCbQuery('Ticket wurde geschlossen ✅');
    } catch (err) {
      console.error('❌ Fehler beim Ticket-Abschluss:', err);
    }
  });

  // === Admin antwortet → User bekommt Nachricht
  bot.on('message', async (ctx) => {
    if (
      ctx.chat.id.toString() === process.env.SUPPORT_GROUP_ID?.toString() ||
      ctx.chat.id.toString() === require('../config').SUPPORT_GROUP_ID?.toString()
    ) {
      const threadId = ctx.message.message_thread_id;
      const userId = Object.keys(activeThreads).find(uid => activeThreads[uid] == threadId);
      if (!userId) return;

      const text = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text || '🗂️ Datei erhalten'}`;
      try {
        await ctx.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler bei Admin-Antwort:', err);
      }
    }
  });
}

module.exports = setupAdminActions;