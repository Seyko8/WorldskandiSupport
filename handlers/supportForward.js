module.exports = async function forwardMessage(ctx, threadId, header = '') {
  const chatId = ctx.chat.id;

  if (ctx.message.text) {
    await ctx.telegram.sendMessage(
      process.env.SUPPORT_GROUP_ID,
      `${header}${ctx.message.text}`,
      {
        message_thread_id: threadId,
        parse_mode: 'Markdown'
      }
    );
  } else if (ctx.message.photo) {
    const photo = ctx.message.photo.pop(); // größte Auflösung
    await ctx.telegram.sendPhoto(
      process.env.SUPPORT_GROUP_ID,
      photo.file_id,
      {
        caption: header + (ctx.message.caption || ''),
        message_thread_id: threadId,
        parse_mode: 'Markdown'
      }
    );
  } else if (ctx.message.video) {
    await ctx.telegram.sendVideo(
      process.env.SUPPORT_GROUP_ID,
      ctx.message.video.file_id,
      {
        caption: header + (ctx.message.caption || ''),
        message_thread_id: threadId,
        parse_mode: 'Markdown'
      }
    );
  } else if (ctx.message.voice) {
    await ctx.telegram.sendVoice(
      process.env.SUPPORT_GROUP_ID,
      ctx.message.voice.file_id,
      {
        caption: header,
        message_thread_id: threadId,
        parse_mode: 'Markdown'
      }
    );
  } else {
    await ctx.telegram.forwardMessage(
      process.env.SUPPORT_GROUP_ID,
      chatId,
      ctx.message.message_id,
      { message_thread_id: threadId }
    );
  }
};