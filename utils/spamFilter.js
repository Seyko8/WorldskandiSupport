// utils/spamFilter.js
const spamPhrases = [
  'wann geht',
  'gruppe offen',
  'ist offen',
  'kommt noch was',
  'wird es geöffnet',
  'wie lange dauert',
  'hallo',
  'any news',
  'wann kommt',
  'noch nix',
  'gruppe zu',
  'öffnen wann',
  'noch kein zugang'
];

function isSpam(text) {
  const lower = text.toLowerCase();
  return spamPhrases.some(p => lower.includes(p));
}

module.exports = isSpam;
