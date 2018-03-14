const puppeteer = require('puppeteer');
const pupConf = require('../../src/config').launch;

pupConf.executablePath = '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe';
pupConf.headless = false;

const account = require('./account-signup');

const runner = require('./signup');
const batchStar = require('./openAndStarRepos');

const { recordAccount } = require('../accounts');

puppeteer.launch(pupConf).then(async browser => {
    const { page, github, email } = await runner(account, browser);
    recordAccount({ github, email, ...account.origin });
    await batchStar(page);
    await browser.close();
});
