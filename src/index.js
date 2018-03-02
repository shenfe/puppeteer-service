const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const sockio = require('socket.io');

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

    Open_puppeteer: {
        await Ppt.open(options.puppeteer);
        console.log('Chrome puppeteer open');
    }

    const app = new Koa();
    const router = new Router();

    if (test) { /* Serve static files for the test page */
        router.get('/test/', (ctx, next) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.resolve(__dirname, './index.html'));
        });
        router.get('/server.config.js', ctx => {
            ctx.type = 'application/javascript';
            ctx.body = `export default { host: '${ipAddr}', port: ${port}, apiName: '${apiName}' }`;
        });
        router.get('/puppeteer-service-client.js', (ctx, next) => {
            ctx.type = 'application/javascript';
            const pscSrc = require.resolve('puppeteer-service-client');
            const pscDist = pscSrc.replace(/(puppeteer-service-client)(.*)$/g, function (...args) {
                return args[1];
            });
            ctx.body = createReadStream(path.resolve(pscDist, 'dist/puppeteer-service-client.js'));
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

    // Serve_socketio_client_js: {
    //     const sockioClientModuleIndex = require.resolve('socket.io-client');
    //     const sockioClientModuleDist = sockioClientModuleIndex.replace(/(socket\.io-client)(.*)$/, function (...args) {
    //         return args[1];
    //     });
    //     router.get('/socket.io/socket.io.js', ctx => {
    //         ctx.type = 'application/javascript';
    //         ctx.body = createReadStream(path.resolve(sockioClientModuleDist, './dist/socket.io.js'));
    //     });
    // }

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

    Set_up_websocket: {
        const io = sockio(server);
        io.on('connection', function (socket) {
            socket.emit('server:echo', { hello: 'world' });
            socket.on('client:some-event', function (data) {
                console.log('client:some-event', data);
            });
        });
    }

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
