const { Markup } = require('telegraf');
const { supportState } = require('./supportState');

function setupMenu(bot) {
  // === /start Befehl
  bot.start(async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';
    await ctx.telegram.sendMessage(ctx.chat.id, `👋 Willkommen @${username} beim Worldskandi Support-Bot!\n\nBitte wähle eine Option:`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📂 FAQ', callback_data: 'menu_faq' },
            { text: '🔗 Links', callback_data: 'menu_links' }
          ],
          [
            { text: '🛠️ Support', callback_data: 'menu_support' },
            { text: '🆕 News', callback_data: 'menu_news' }
          ]
        ]
      }
    });
  });

  // === START-MENÜ (für Zurück-Buttons)
  bot.action('start', async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || 'User';
    await ctx.editMessageText(`👋 Willkommen @${username} beim Worldskandi Support-Bot!\n\nBitte wähle eine Option:`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📂 FAQ', callback_data: 'menu_faq' },
            { text: '🔗 Links', callback_data: 'menu_links' }
          ],
          [
            { text: '🛠️ Support', callback_data: 'menu_support' },
            { text: '🆕 News', callback_data: 'menu_news' }
          ]
        ]
      }
    });
  });

  // === FAQ
  bot.action('menu_faq', async (ctx) => {
    const text = `📂 *Häufige Fragen (FAQ)*\n\n` +
      `1️⃣ Wie bekomme ich VIP?\n👉 Über unseren VIP-Bot: @WSkandiVipBot\n\n` +
      `2️⃣ Was kostet VIP?\n💸 Einmalig 50 € oder 100 € – kein Abo.\n\n` +
      `3️⃣ Wie erhalte ich Zugang?\n📨 Nach der Zahlung bekommst du sofort den Link.\n\n` +
      `4️⃣ Was bringt mir der Forward-Chat?\n📡 Du erhältst alle Beiträge aus der Hauptgruppe direkt in einem privaten Kanal.\n\n` +
      `5️⃣ Welche Gruppe öffnet?\n🕒 Wir haben keine festen „Öffnungszeiten“. Halte die Gruppe [im Blick](https://t.me/+PaDv9IeSOSw3Njgy) – dort bekommst du vor jeder Öffnung eine Nachricht.\n\n` +
      `6️⃣ Welche Gruppen gibt es?\n📋 Eine Übersicht aller Gruppen findest du [hier](https://t.me/Worldskandinavi)\n\n` +
      `7️⃣ Wodurch kann ich gebannt werden?\n🚫 Das Regelwerk gilt für alle User. Bei Unsicherheit → Admin fragen.`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === LINKS
  bot.action('menu_links', async (ctx) => {
    const text = '🔗 *Wichtige Links:*';

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📸 Instagram', url: 'https://instagram.com/offiziell.worldskandi' }],
          [{ text: '👻 Snapchat', url: 'https://www.snapchat.com/@offiziellwsk' }],
          [{ text: '🎥 Velvet', url: 'https://t.me/VelvetGlobal' }],
          [{ text: '🔞 Skandi', url: 'https://t.me/+h_SoVDxZc1lhZjRh' }],
          [{ text: '💾 Speicher-Kanal', url: 'https://t.me/+Be0bO9BWhHk1ZWU0' }],
          [{ text: '📋 Beitrittsliste', url: 'https://t.me/addlist/ztczKNjf1LNjMzFk' }],
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });
  });

  // === NEWS (optional)
  bot.action('menu_news', async (ctx) => {
    await ctx.editMessageText('🆕 Es gibt aktuell keine neuen Ankündigungen.', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Zurück', callback_data: 'start' }]]
      }
    });
  });

  // === SUPPORT: Anliegen-Auswahl
  bot.action('menu_support', async (ctx) => {
    supportState[ctx.from.id] = { step: 'choose_topic' };

    await ctx.editMessageText('📩 *Support starten*\n\nBitte wähle dein Anliegen:', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📦 VIP-Zugang', callback_data: 'support_vip' }],
          [{ text: '💰 Payment / Forward Chat', callback_data: 'support_payment' }],
          [{ text: '🛠️ Technisches Problem', callback_data: 'support_tech' }],
          [{ text: '📝 Sonstiges', callback_data: 'support_other' }],
          [{ text: '🔙 Zurück', callback_data: 'start' }]
        ]
      }
    });

    await ctx.answerCbQuery();
  });
}

module.exports = setupMenu;