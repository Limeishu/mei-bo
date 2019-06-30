import KoaRouter from 'koa-router';
import Bot from './model/bot';

const api = new KoaRouter();
const bot = new Bot(process.env.BOT_TOKEN);
bot.setWebhook(process.env.BOT_WEBHOOK);

api.post(`/${bot.ID}`, async context => {
  try {
    console.log(context);
  } catch (error) {
    console.error('[ERROR]', error);
    throw new Error(error);
  }
});

export default api;
