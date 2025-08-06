const supportState = {};       // z. B. { 12345678: { step: 'waiting_message', topic: 'vip' } }
const activeThreads = {};      // z. B. { 12345678: 44 } (User → Thread ID)

module.exports = {
  supportState,
  activeThreads
};