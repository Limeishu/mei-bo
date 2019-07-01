import KoaRouter from 'koa-router';
import Bot from './model/bot';

const api = new KoaRouter();
const bot = new Bot(process.env.BOT_TOKEN);
bot.setWebhook(process.env.BOT_WEBHOOK);

api
  .post(`/${bot.ID}`, async ctx => {
    try {
      bot.receivedMessage(ctx.request.body);
      ctx.body = { ok: true, result: false };
    } catch (error) {
      console.error('[ERROR]', error);
      throw new Error(error);
    }
  })
  .post(`/${bot.ID}/broadcast`, async ctx => {
    try {
      await bot.agentBroadcastHook(ctx.request.body.chatId);
      ctx.body = { ok: true, result: false };
    } catch (error) {
      console.error('[ERROR]', error);
      throw new Error(error);
    }
  });

export default api;
