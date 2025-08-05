const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');

const bot = new Telegraf(BOT_TOKEN);

// === Handler registrieren ===
require('./handlers/menuHandler')(bot);
require('./handlers/supportHandler')(bot);

// === Start ===
bot.launch();
console.log('🤖 Support-Bot läuft...');

// === Stoppe sauber bei Strg+C
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));