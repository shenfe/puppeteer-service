const puppeteer = require('puppeteer');

const { launch } = require('./config');

const { evaluate } = require('./util');

let browser;
let status = 0;

const open = async (options = {}) => {
    if (status === 1) return 0;
    browser = await puppeteer.launch({
        ...launch,
        ...options
    });
    status = 1;
    return 0;
};

const close = () => {
    return browser.close().then(_ => {
        console.log('Chromium and all of its pages have been closed.');
        browser = null;
        status = 0;
        return 0;
    }).catch(e => {
        console.error(e);
    });
};

const run = async (url, fn, injection = {}) => {
    let page, result;
    try {
        page = await browser.newPage();
        await page.goto(url);
        result = await evaluate(`(${fn})(page)`, { page, echo: injection.echo });
    } catch (e) {
        console.error(e);
        result = {};
    }
    page.close();
    return result || {};
};

module.exports = {
    open,
    close,
    run,
    process: () => browser && browser.process()
};
