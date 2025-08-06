const { activeThreads } = require('./supportState');

function setupAdminActions(bot) {
  bot.action(/^accept_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    await ctx.answerCbQuery('✅ Akzeptiert');
    await ctx.telegram.sendMessage(userId, '✅ Ein Admin kümmert sich gleich um dein Anliegen.');
  });

  bot.action(/^deny_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];
    await ctx.answerCbQuery('❌ Abgelehnt');
    await ctx.telegram.sendMessage(userId, '❌ Dein Anliegen wurde abgelehnt.');
  });

  bot.action(/^close_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    delete activeThreads[userId];
    await ctx.answerCbQuery('✅ Ticket geschlossen');
    await ctx.telegram.sendMessage(userId, '✅ Dein Ticket wurde geschlossen. Du kannst jetzt ein neues eröffnen.');
  });
}

module.exports = setupAdminActions;