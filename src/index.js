const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const { createReadStream } = require('fs');

const fnsb = require('function-sandbox');

const ObjectParse = require('./parse');
const Ppt = require('./puppeteer');

const config = require('./config');
const privates = require('./config/privates');

const path = require('path');
const ip = require('ip');
const ipAddr = ip.address();

const gracefulShutdown = require('http-graceful-shutdown');

module.exports = async function (options = {}) {
    const test = !!options.test;
    const port = options.port || config.server.port;
    const apiName = options.api || config.server.apiName;

    await Ppt.open(options.puppeteer);
    console.log('Chrome puppeteer open');

    const app = new Koa();
    const router = new Router();

    /* Serve static files for the test page */
    if (test) {
        router.get('/test/', (ctx, next) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.resolve(__dirname, '../src/index.html'));
        });
        router.get('/src/config/server.mjs', ctx => {
            ctx.type = 'application/javascript';
            ctx.body = `export default { host: '${ipAddr}', port: ${port}, apiName: '${apiName}' }`;
        });
        ['/src/request.mjs', '/src/stringify.mjs'].forEach(p => {
            router.get(p, (ctx, next) => {
                ctx.type = 'application/javascript';
                ctx.body = createReadStream(path.resolve(__dirname, `..${p}`));
            });
        });
    }

    router.post(`/${apiName}`, async function (ctx) {
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
    });

    router.post(`/puppeteer`, async function (ctx, next) {
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        let { key, cmd, opt } = ctx.request.body;
        ctx.status = 200;
        if (key === privates.key) {
            let re = await Ppt[cmd](opt);
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
            code: -1,
            message: 'error'
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

    const server = app.listen(+port);
    console.log('Listening port ' + port);
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
