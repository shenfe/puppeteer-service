const puppeteer = require('puppeteer');

const { launch } = require('./config');

let browser;

(async () => {
    browser = await puppeteer.launch({
        ...launch
    });
})();

const close = () => {
    return browser.close().then(_ => {
        console.log('Chromium and all of its pages have been closed.');
        browser = null;
    }).catch(e => {
        console.error(e);
    });
};

const run = async (url, fn) => {
    try {
        const page = await browser.newPage();
        await page.goto(url);
        const result = await fn(page);
        await page.close();
        return result;
    } catch (e) {
        console.error(e);
        return {};
    }
};

module.exports = {
    run,
    close
};
