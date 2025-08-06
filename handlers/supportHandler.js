const supportState = require('./supportState');
const setupTicketFlow = require('./supportTicketFlow');
const setupAdminActions = require('./supportAdminActions');

function supportHandler(bot) {
  // Alle Teile laden
  setupTicketFlow(bot, supportState);
  setupAdminActions(bot, supportState);
}

module.exports = supportHandler;