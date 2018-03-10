const url = 'http://www.zhihu.com/';

const puppeteer = require('puppeteer');
const pupConf = require('../../src/config').launch;

pupConf.headless = false;

const readlineSync = require('readline-sync');
const username = readlineSync.question('weibo username: ');
const password = readlineSync.question('weibo password: ', {
    hideEchoBack: true
});
if (readlineSync.question('set the executable path of chromium? [yn]: ') === 'y') {
    pupConf.executablePath = '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe';
}

const runner = require('./elem-extract');

const fs = require('fs');
const path = require('path');
const open = require('open');

puppeteer.launch(pupConf).then(async browser => {
    const resultHtml = await runner({
        username,
        password,
        url
    }, browser);
    await browser.close();

    const filePath = path.resolve(__dirname, `${Date.now()}.html`);
    fs.writeFileSync(filePath, resultHtml, 'utf8');
    open(filePath);
});
