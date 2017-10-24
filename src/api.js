const puppeteer = require('puppeteer');

let browser;

(async () => {
    browser = await puppeteer.launch();
})();

module.exports.open = async (url, options, dtd) => {
    const page = await browser.newPage();
    await page.goto(url);

    // TODO

    await browser.close();
};
