import Koa from 'koa';
import KoaJson from 'koa-json';
import BodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

const app = new Koa();

app.use(KoaJson);
app.use(BodyParser);
app.use(cors());
