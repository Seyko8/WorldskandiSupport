const setupMenu = require('./menuHandler');
const setupTicketFlow = require('./supportTicketFlow');
const setupAdminActions = require('./supportAdminActions');

function registerSupport(bot) {
  // 📂 Menü-Handler (FAQ, Links, News, Zurück)
  setupMenu(bot);

  // 🎫 Ticket-Flow (User schreibt → Thread oder General)
  setupTicketFlow(bot);

  // 🛡️ Admin-Buttons (Akzeptieren, Ablehnen, Abschließen)
  setupAdminActions(bot);
}

module.exports = { registerSupport };