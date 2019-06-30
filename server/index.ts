import Koa from 'koa';
import KoaJson from 'koa-json';
import BodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import api from './api';

const app = new Koa();

app.use(KoaJson);
app.use(BodyParser);
app.use(cors());
app.use(api.routes());

app.listen(process.env.PORT || 3000);
