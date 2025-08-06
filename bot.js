const { Telegraf } = require('telegraf');
const supportHandler = require('./handlers/supportHandler');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Support aktivieren
supportHandler(bot);

// Bot starten
bot.launch();
console.log('🤖 Support-Bot läuft...');