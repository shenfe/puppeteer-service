const { wait } = require('../../src/util');

module.exports = async ({ username, password }, browser) => {
    const page = await browser.newPage();
    await page.goto('https://github.com/login');

    await wait(1000);

    const usernameSelector = 'input#login_field';
    const passwordSelector = 'input#password';

    await page.type(usernameSelector, username);
    await page.type(passwordSelector, password);
    await page.click('#login form > div:last-child input:last-child');

    await page.waitForNavigation();
    const result = await page.$eval('ul.mini-repo-list', e => e.innerText);
    console.log(result);

    return page;
};
