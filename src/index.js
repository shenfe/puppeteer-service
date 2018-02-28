const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const fnsb = require('function-sandbox');

const ObjectParse = require('./parse');
const Ppt = require('./puppeteer');

const config = require('./config');
const privates = require('./config/private');

const gracefulShutdown = require('http-graceful-shutdown');

module.exports = async function (options = {}) {
    if (typeof options.port === 'number') {
        config.server.port = options.port;
    }
    if (typeof options.api === 'string') {
        config.server.apiName = options.api;
    }

    await Ppt.open();

    const app = new Koa();
    const router = new Router();

    router.post(`/${config.server.apiName}`, async function (ctx, next) {
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        // console.log('request.body', ctx.request.body);
        // console.log('response.header', ctx.response.header);
        let data = ObjectParse(ctx.request.body.data);
        console.log('data', data);
        ctx.status = 200;
        ctx.body = await Ppt.run(data.url, fnsb(data.run, {
            ...data.options,
            asFunction: true
        }));
        await next();
    });

    router.post(`/puppeteer`, async function (ctx, next) {
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        let { key, cmd } = ctx.request.body;
        ctx.status = 200;
        if (key === privates.key) {
            let re = await Ppt[cmd]();
            ctx.body = {
                code: re === 0 ? 0 : 1,
                message: re === 0 ? 'success' : 'failure'
            };
        } else {
            ctx.body = {
                code: -1,
                message: 'error'
            };
        }
        await next();
    });

    router.post(`/stop`, async function (ctx, next) {
        let key = ctx.request.body.key;
        if (key === privates.key) {
            process.exit(0);
        }
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        ctx.status = 200;
        ctx.body = {
            code: 0,
            message: ''
        };
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

    const server = app.listen(config.server.port);
    gracefulShutdown(server, {
        onShutdown: () => {
            console.log('Closing...');
            return Ppt.close();
        }
    });

    return {
        koaApp: app,
        server
    };
};
