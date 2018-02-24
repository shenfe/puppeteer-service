const puppeteer = require('puppeteer');

const { wait } = require('../util');

module.exports = async ({
    username,
    password
}, puppeteerConf = {}) => {
    puppeteer.launch(puppeteerConf).then(async browser => {
        const page = await browser.newPage();
        await page.goto('https://mail.163.com/');

        await wait(1000);

        await page.waitForSelector('#x-URS-iframe');
        let frames = await page.frames();
        const frame = frames[3];
        const frameContext = await frame.executionContext();

        const usernameSelector = '#login-form > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > input:nth-of-type(1)';
        const passwordSelector = '#login-form > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(2) > input:nth-of-type(2)';

        await frameContext.evaluate(`document.body.querySelector('${usernameSelector}').value = '${username}'`);
        await frameContext.evaluate(`document.body.querySelector('${passwordSelector}').value = '${password}'`);
        await frameContext.evaluate(`document.body.querySelector('#dologin').click()`);

        await page.waitForNavigation();
        await page.waitForSelector('.mboxlst');
        const result = await page.evaluate(_ => {
            let q = document.body.querySelectorAll('.mboxlst');
            return q[q.length - 1].innerText;
        }, 7);
        console.log(result);

        await browser.close();
    });
};
