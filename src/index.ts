import { Bot, InlineKeyboard, Context, session, SessionFlavor, webhookCallback} from "grammy";
import {startQueueMessageHandler} from './azure-queue';
import {addTGUser} from './azure-table';
import express from "express";

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body


//Store bot screaming status
let permit = false;
const TOKEN_BOT = process.env.TOKEN_BOT;
if(!TOKEN_BOT){
    console.log('TOKEN_BOT not defined');
    throw new Error('TOKEN_BOT not defined');
}
console.log('start');
const bot = new Bot(TOKEN_BOT.toString());
console.log('start TOKEN_BOT');
//This function handles the /scream command
bot.command("permit", () => {
    permit = true;
 });

//This function handles /whisper command
bot.command("opt-out", () => {
    permit = false;
 });

//Pre-assign menu text
const firstMenu = "<b>Permit</b>\n\nInitial permit before knowledge test(NOT CDL)";

//Pre-assign button text
const nextButton = "Next";
const backButton = "Back";
const tutorialButton = "Tutorial";

//Build keyboards
const firstMenuMarkup = new InlineKeyboard().text(nextButton, backButton);
 
const secondMenuMarkup = new InlineKeyboard().text(backButton, backButton).text(tutorialButton, "https://core.telegram.org/bots/tutorial");


//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(firstMenu, {
    reply_markup: firstMenuMarkup,
    parse_mode: "HTML",
   });
 });

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {

  const tgUser = {
    id: ctx.message.chat.id,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
  };
  if(ctx.message.text === '/start'){
    await addTGUser(tgUser);
    return ctx.reply(`Hi, ${tgUser.first_name}!`);
  }

  if (permit && ctx.message.text) {
    await ctx.reply(`Let's start to find permit. What's your zip code`, {
      entities: ctx.message.entities,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

//Start the Bot
// bot.start();
// "express" is also used as default if no argument is given.
const domain = process.env.DOMAIN ?? "tgbot--396j687.salmonsand-0d66399e.centralus.azurecontainerapps.io";
app.post(`/${TOKEN_BOT}`, (req,res)=>{
  console.log('webhookCallback');
  webhookCallback(bot, "express")
});
app.get(`/health`, (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date()
  }
  res.status(200).send(data);
});
const server = app.listen(Number(8888), async () => {
  // Make sure it is `https` not `http`!
  await bot.api.setWebhook(`https://${domain}/${TOKEN_BOT}`);
});

const gracefulShutdown = (myApp:any)=>{
  console.log('SIGTERM signal received: closing HTTP server');
  myApp.close(() => {
    console.log('HTTP server closed')
  });
};

process.once("SIGINT", () => gracefulShutdown(server));
process.once("SIGTERM", () => gracefulShutdown(server));
