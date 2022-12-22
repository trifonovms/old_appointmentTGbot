import { Bot, InlineKeyboard, Context, session, SessionFlavor} from "grammy";
import {startQueueMessageHandler} from './azure-queue';
import {addTGUser} from './azure-table';

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

// //This handler processes next button on the menu
// bot.callbackQuery(nextButton, async (ctx) => {
//   //Update message content with corresponding menu section
//   await ctx.editMessageText(secondMenu, {
//     reply_markup: secondMenuMarkup,
//     parse_mode: "HTML",
//    });
//  });

// const BOT_DEVELOPER = 1374826521; // bot developer chat identifier

// bot.use(async (ctx, next) => {
//   // Modify context object here by setting the config.
//   ctx.config = {
//     botDeveloper: BOT_DEVELOPER,
//     isDeveloper: ctx.from?.id === BOT_DEVELOPER,
//   };
//   // Run remaining handlers.
//   await next();
// });

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
  }
  // //Print to console
  // await bot.api.sendMessage(1374826521, 'My test');
  // console.log(
  //   `${ctx.from.first_name} wrote ${
  //     "text" in ctx.message ? ctx.message.text : ""
  //   }`,
  // );

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


const sendUserAlert = async (msgQueue:string)=>{
  const obj = JSON.parse(msgQueue);
  const text = `${obj.message} Link: ${obj.link}`;
  await bot.api.sendMessage(1374826521, text);
}
// startQueueMessageHandler(sendUserAlert);
//Start the Bot
bot.start();



 /**
     * Send POST to 'https://api.telegram.org/bot5942014704:AAEQ_SS7TtrEHBj8Pc_DBNVefgop_MpPpUc/sendMessage'
{
  method: "POST",
  headers: {
    "content-type": "application/json",
    connection: "keep-alive",
  },
  body: "{\"chat_id\":1374826521,\"text\":\"My test\"}",
}
     */