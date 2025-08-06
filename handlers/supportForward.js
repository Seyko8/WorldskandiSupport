const { SUPPORT_GROUP_ID } = require('../config');

async function forwardMessage(ctx, threadId, header) {
  const caption = header + (ctx.message.caption || ctx.message.text || '');

  if (ctx.message.photo) {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    return ctx.telegram.sendPhoto(SUPPORT_GROUP_ID, fileId, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (ctx.message.video) {
    return ctx.telegram.sendVideo(SUPPORT_GROUP_ID, ctx.message.video.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (ctx.message.voice) {
    return ctx.telegram.sendVoice(SUPPORT_GROUP_ID, ctx.message.voice.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (ctx.message.document) {
    return ctx.telegram.sendDocument(SUPPORT_GROUP_ID, ctx.message.document.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (ctx.message.text) {
    return ctx.telegram.sendMessage(SUPPORT_GROUP_ID, caption, {
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }
}

module.exports = forwardMessage;