const { Markup } = require('telegraf');
const { SUPPORT_GROUP_ID } = require('../config');
const { activeThreads } = require('./supportState');

function registerSupportActions(bot) {
  // ✅ Akzeptieren
  bot.action(/^accept_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];

    try {
      await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
      await ctx.answerCbQuery('✅ Ticket akzeptiert.');
    } catch (err) {
      console.error('❌ Fehler beim Akzeptieren:', err.message);
      await ctx.answerCbQuery('⚠️ Fehler beim Akzeptieren.', { show_alert: true });
    }
  });

  // ❌ Ablehnen
  bot.action(/^deny_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];

    try {
      await ctx.telegram.sendMessage(userId, '❌ Deine Support-Anfrage wurde abgelehnt.');
      delete activeThreads[userId];
      await ctx.answerCbQuery('❌ Anfrage abgelehnt.');
    } catch (err) {
      console.error('❌ Fehler beim Ablehnen:', err.message);
      await ctx.answerCbQuery('⚠️ Fehler beim Ablehnen.', { show_alert: true });
    }
  });

  // ✅ Ticket abschließen
  bot.action(/^close_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];

    try {
      delete activeThreads[userId];
      await ctx.telegram.sendMessage(userId, '✅ Dein Support-Ticket wurde abgeschlossen. Du kannst jetzt wieder ein neues Ticket erstellen.');
      await ctx.answerCbQuery('🟢 Ticket abgeschlossen.');
    } catch (err) {
      console.error('❌ Fehler beim Ticket-Abschluss:', err.message);
      await ctx.answerCbQuery('⚠️ Fehler beim Abschließen.', { show_alert: true });
    }
  });
}

module.exports = registerSupportActions;