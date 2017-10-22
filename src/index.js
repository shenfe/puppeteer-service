const ppt = require('./api');

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();
const cors = require('@koa/cors');

router.post('/open', function (ctx, next) {
    // ctx.router available 
});

app
    .use(cors({
        origin: '*',
        credentials: true
    }))
    .use(router.routes())
    .use(router.allowedMethods())
    .use(bodyParser())
    .use(ctx => {
        // TODO
    })
;

app.listen(3000);
