require = require('@std/esm')(module);

const serverConf = require('./server.mjs').default;

module.exports = {
    server: serverConf,
    launch: {
        headless: true
    }
};
