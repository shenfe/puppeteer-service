const sticky = require('sticky-session');
const http = require('http');

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

const SessionMap = require('./table');

const gracefulShutdown = require('http-graceful-shutdown');

module.exports = async function (options = {}) {
    const useCluster = !!options.cluster;
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
        const { sessId, sockId } = ctx.request.body;
        const data = ObjectParse(ctx.request.body.data);
        console.log('data', data); // test
        ctx.status = 200;

        const injection = {
            echo: function (data) {
                const skt = socksesses.get(sessId);
                if (!skt) return;
                skt.emit('server:echo', data);
            }
        };

        if (!data.options) data.options = {};
        if (!data.options.whiteList) data.options.whiteList = [];
        data.options.whiteList = data.options.whiteList.concat(Object.keys(injection));

        console.log(ctx.request.url, ' begin'); // test

        ctx.body = await Ppt.run(data.url, fnsb(data.run, {
            ...data.options,
            asFunction: true
        }), injection);

        console.log(ctx.request.url, ' end'); // test

        const skt = socksesses.get(sessId);
        skt && skt.emit('server:close', 'done') && skt.disconnect();
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

    const server = http.createServer(app.callback());

    const socksesses = new SessionMap();
    Set_up_websocket: {
        const io = sockio(server);
        io.on('connect', function (socket) {
            const sid = socket.handshake.query.sessId;
            socksesses.put(sid, socket);
            socket.emit('server:greet', { hello: sid });
            socket.on('client:some-event', function (data) {
                console.log('client:some-event', data);
            });
            socket.on('disconnect', reason => {
                socksesses.del(sid);
            });
        });
    }

    gracefulShutdown(server, {
        onShutdown: () => {
            console.log('Closing...');
            return Ppt.close();
        }
    });

    if (useCluster) {
        if (!sticky.listen(server, +port)) {
            // Master code
            server.once('listening', function () {
                console.log(`Server started on ${port} port`);
            });
        } else {
            // Worker code
        }
    } else {
        server.listen(+port, function () {
            console.log(`Server started on ${port} port`);
        });
    }

    return {
        koaApp: app,
        server
    };
};
