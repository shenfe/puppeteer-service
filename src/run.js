const puppeteer = require('puppeteer');

const config = require('../puppeteer.config');

let browser;

(async () => {
    browser = await puppeteer.launch(config);
})();

module.exports = async (url, fn) => {
    const page = await browser.newPage();
    await page.goto(url);
    const result = await fn(page);
    await page.close();
    return result;
};
