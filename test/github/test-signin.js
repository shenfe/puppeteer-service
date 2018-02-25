const puppeteer = require('puppeteer');
const pupConf = require('../../puppeteer.config');

const account = require('./account-signin');

const runner = require('./signin');

puppeteer.launch(pupConf).then(async browser => {
    await runner(account, browser);
    await browser.close();
});
