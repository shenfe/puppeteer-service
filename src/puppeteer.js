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

const run0 = async (url, fn, injection = {}) => {
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

const run = async (url, fn, injection = {}) => {
    return browser.newPage().then(async page => {
        await page.goto(url);
        return evaluate(`(${fn})(page)`, { page, echo: injection.echo }).then(data => {
            page.close();
            return data;
        }, () => {
            page.close();
            return {};
        });
    });
};

const pageCount = async () => {
    if (!browser) return -1;
    let pages = await browser.pages();
    return pages.length;
};

module.exports = {
    open,
    close,
    run,
    process: () => browser && browser.process(),
    pageCount
};
