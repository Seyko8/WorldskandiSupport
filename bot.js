require('dotenv').config();
const { Telegraf } = require('telegraf');
const { registerSupport } = require('./handlers/supportHandler');

const bot = new Telegraf(process.env.BOT_TOKEN);
registerSupport(bot);
bot.launch();

console.log('🤖 Worldskandi Support-Bot läuft...');