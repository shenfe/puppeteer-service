const puppeteer = require('puppeteer');
const pupConf = require('../../puppeteer.config');

const account = require('./account-signup');

const runner = require('./signup');

puppeteer.launch(pupConf).then(async browser => {
    await runner(account, browser);
    await browser.close();
});
