const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const { registerSupport } = require('./handlers/supportHandler');

const bot = new Telegraf(BOT_TOKEN);

registerSupport(bot);

bot.launch();
console.log('🤖 Support-Bot läuft...');