// Speichert den Status vom User (z. B. Thema gewählt, Nachricht schreiben etc.)
const supportState = {};

// Speichert aktive Support-Tickets → userId : threadId
const activeThreads = {};

module.exports = {
  supportState,
  activeThreads
};