import KoaRouter from 'koa-router';
import Bot from './model/bot';
import commandHandler from './util/commandHandler';
import { ITGServerMessage } from './util/resolver';

const api = new KoaRouter();
const bot = new Bot(process.env.BOT_TOKEN);
bot.setWebhook(process.env.BOT_WEBHOOK);

api.post(`/${bot.ID}`, async ctx => {
  try {
    bot.receivedMessage(ctx.request.body);
    ctx.body = { ok: true, result: false };
  } catch (error) {
    console.error('[ERROR]', error);
    throw new Error(error);
  }
});

export default api;
