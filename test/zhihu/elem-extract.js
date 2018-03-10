const fs = require('fs');
const path = require('path');

module.exports = async ({
    username,
    password,
    url
}, browser) => {
    const page = await browser.newPage();

    await page.setViewport({
        width: 1280,
        height: 720
    });
    await page.goto(url);

    await page.waitFor(1000);

    await page.waitForSelector('.SignContainer-switch');
    await page.click('.SignContainer-switch>span[data-reactid]');
    await page.waitForSelector('.Button.Login-socialButtonEntrance');
    await page.click('.Button.Login-socialButtonEntrance');
    await page.$$eval('.Button.Login-socialButton', btns => btns[1].click());
    await page.waitForNavigation();

    await page.waitFor(1000);
    await page.type(`#userId`, username);
    await page.type(`#passwd`, password);
    await page.click('.formbtn_01');

    await page.waitForNavigation();
    await page.click('#email');
    await page.click('.WB_btn_allow');

    await page.waitForNavigation();

    await page.waitFor(1000);

    // await page.addScriptTag({
    //     url: 'https://raw.githubusercontent.com/shenfe/FeSpider/master/src/fespider/FeSpider.js'
    // });

    const result = await page.evaluate((x, js) => {
        (new Function(js))();
        fespider.present(document.querySelector(x));
        return document.documentElement.outerHTML;
    }, '.TopstoryItem:nth-child(1)', fs.readFileSync(path.resolve(__dirname, './fespider.js'), 'utf8'));

    await page.waitFor(1000);

    // console.log(result);

    return result;
};
