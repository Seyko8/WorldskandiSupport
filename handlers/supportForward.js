const { SUPPORT_GROUP_ID } = require('../config');

async function forwardMessage(ctx, threadId, header = '') {
  const message = ctx.message;

  const caption = header + (message.caption || message.text || '');

  if (message.photo) {
    const file = message.photo[message.photo.length - 1].file_id;
    return ctx.telegram.sendPhoto(SUPPORT_GROUP_ID, file, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (message.video) {
    return ctx.telegram.sendVideo(SUPPORT_GROUP_ID, message.video.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (message.voice) {
    return ctx.telegram.sendVoice(SUPPORT_GROUP_ID, message.voice.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (message.document) {
    return ctx.telegram.sendDocument(SUPPORT_GROUP_ID, message.document.file_id, {
      caption,
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  if (message.text) {
    return ctx.telegram.sendMessage(SUPPORT_GROUP_ID, caption, {
      parse_mode: 'Markdown',
      message_thread_id: threadId
    });
  }

  // fallback: einfach forwarden
  return ctx.telegram.forwardMessage(SUPPORT_GROUP_ID, ctx.chat.id, message.message_id, {
    message_thread_id: threadId
  });
}

module.exports = forwardMessage;