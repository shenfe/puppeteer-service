const puppeteer = require('puppeteer');
const pupConf = require('../../puppeteer.config');

const accounts = require('./accounts');

let a = accounts[0];

const runner = require('./signin');

puppeteer.launch(pupConf).then(async browser => {
    await runner(a, browser);
    await browser.close();
});
