const puppeteer = require('puppeteer');

const { launch } = require('./config');

let browser;

(async () => {
    browser = await puppeteer.launch({
        ...launch
    });
})();

module.exports = async (url, fn) => {
    const page = await browser.newPage();
    await page.goto(url);
    const result = await fn(page);
    await page.close();
    return result;
};
