const setupTicketFlow = require('./supportTicketFlow');
const setupAdminActions = require('./supportAdminActions');
const setupMenu = require('./menuHandler');

function registerSupport(bot) {
  // 🔧 Lade alle Support-bezogenen Module
  setupMenu(bot);             // Menü: FAQ, Links, Start, News
  setupTicketFlow(bot);       // Ticket-Flow: Anfrage senden, Spam-Check, Weiterleitung
  setupAdminActions(bot);     // Admin-Aktionen: Akzeptieren, Ablehnen, Abschließen
}

module.exports = { registerSupport };