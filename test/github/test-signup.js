const puppeteer = require('puppeteer');
const pupConf = require('../../src/config').launch;

const account = require('./account-signup');

const runner = require('./signup');

puppeteer.launch(pupConf).then(async browser => {
    await runner(account, browser);
    await browser.close();
});
