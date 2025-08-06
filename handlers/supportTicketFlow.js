const { SUPPORT_GROUP_ID } = require('../config');
const activeThreads = require('../state/activeThreads');

function handleAdminReplies(bot) {
  bot.on('message', async (ctx) => {
    const isFromSupportGroup = ctx.chat.id.toString() === SUPPORT_GROUP_ID.toString();
    const threadId = ctx.message.message_thread_id;
    const isFromAdmin = !ctx.from.is_bot;

    if (isFromSupportGroup && threadId && isFromAdmin) {
      const userId = Object.entries(activeThreads).find(
        ([uid, tid]) => tid === threadId
      )?.[0];

      if (!userId) return;

      const replyText = `📩 *Antwort vom Worldskandi Team*\n\n💬 ${ctx.message.text}`;

      try {
        await ctx.telegram.sendMessage(userId, replyText, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Fehler beim Antworten an User:', err.description || err.message);
      }
    }
  });
}

module.exports = handleAdminReplies;