const ppt = require('./api');

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();
const cors = require('@koa/cors');

const util = require('./util');

router.post('/open', async function (ctx, next) {
    ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
    ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
    console.log('response.header', ctx.response.header);
    let data = ctx.request.body;
    console.log('data', data);
    console.log('dtd', util.ObjectParse(data.dtd));
    ctx.status = 200;
    ctx.body = ({
        hello: 'world'
    });
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
