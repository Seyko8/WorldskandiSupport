const setupTicketFlow = require('./supportTicketFlow');
const setupAdminActions = require('./supportAdminActions');
const setupMenu = require('./menuHandler');

function registerSupport(bot) {
  const supportState = require('./supportState');

  setupMenu(bot);
  setupTicketFlow(bot, supportState);
  setupAdminActions(bot);
}

module.exports = { registerSupport };