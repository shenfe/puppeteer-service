const Run = require('puppeteer-service-client');

const account = require('./account');

const runner = require('./signin');

const { wait } = require('../../src/util');

const { port, apiName } = require('../../src/config').server;

Run(`http://127.0.0.1:${port}/${apiName}`, {
    url: 'https://mail.163.com/',
    run: runner,
    options: {
        injection: {
            wait,
            ...account
        }
    }
})
    .then(data => console.log(JSON.stringify(data)))
    .catch(err => console.error(err));
