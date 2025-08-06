const setupTicketFlow = require('./supportTicketFlow');
const setupAdminActions = require('./supportAdminActions');
const setupMenu = require('./menuHandler');

function supportHandler(bot) {
  setupMenu(bot);
  setupTicketFlow(bot);
  setupAdminActions(bot);
}

module.exports = supportHandler;