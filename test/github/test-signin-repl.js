const puppeteer = require('puppeteer');
const pupConf = require('../../src/config').launch;

const readlineSync = require('readline-sync');
const username = readlineSync.question('username: ');
const password = readlineSync.question('password: ', {
    hideEchoBack: true
});

if (readlineSync.question('set the executable path of chromium? [yn]: ') === 'y') {
    pupConf.executablePath = '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe';
}

const account = { username, password };

const runner = require('./signin');

puppeteer.launch(pupConf).then(async browser => {
    await runner(account, browser);
    await browser.close();
});
