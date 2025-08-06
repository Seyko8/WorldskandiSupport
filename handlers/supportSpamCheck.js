const spamPhrases = [
  'wann ist gruppe offen',
  'wann geht',
  'gruppe offen',
  'öffnen wann',
  'wann wieder offen',
  'wie lange dauert',
  'kommt heute was',
  'any news',
  'offen wann',
  'noch nix',
  'noch nichts gekommen',
  'gruppe zu',
  'geht bald auf',
  'wann auf',
  'was los',
  'geht noch was',
  'warum nix kommt'
];

function isSpam(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return spamPhrases.some(phrase => lower.includes(phrase));
}

module.exports = isSpam;