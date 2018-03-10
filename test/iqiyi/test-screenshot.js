const url = 'http://www.iqiyi.com/';

const puppeteer = require('puppeteer');
const pupConf = require('../../src/config').launch;

const readlineSync = require('readline-sync');
if (readlineSync.question('set the executable path of chromium? [yn]: ') === 'y') {
    pupConf.executablePath = '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe';
}

const runner = require('./screenshot');

const open = require('open');

puppeteer.launch(pupConf).then(async browser => {
    const result = await runner(url, browser);
    await browser.close();
    open(result.path);
});
