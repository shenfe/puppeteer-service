const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();
const cors = require('@koa/cors');

const util = require('./util');

const run = require('./run');

router.post('/run', async function (ctx, next) {
    ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
    ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
    console.log('request.body', ctx.request.body);
    console.log('response.header', ctx.response.header);
    let data = util.ObjectParse(ctx.request.body.data);
    console.log('data', data);
    ctx.status = 200;
    ctx.body = await run(data.url, data.run);
    await next();
});

app
    .use(cors({
        // origin: '*',
        credentials: true
    }))
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
;

app.listen(3000);
