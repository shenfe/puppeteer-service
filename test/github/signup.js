const { wait } = require('../util');

const changeUsername = (username, salt) => {
    let s = 'abcdefghijklmnopqrstuvwxyz'[Math.ceil(Math.random() * 10000) % 26];
    return {
        username: (_, s) => ('' + _ + s),
        salt: s
    };
};

const changePassword = (password, salt) => {
    let s = Math.ceil(Math.random() * 10000) % 10;
    return {
        password: (_, s) => ('' + _ + s),
        salt: s
    };
};

const setInput = async (page, selector, value) => {
    await page.$eval(selector, input => input.value = '');
    await page.focus(selector);
    await page.keyboard.type(value);
};

module.exports = async ({ username, password, email }, browser) => {
    const page = await browser.newPage();

    const pageUrl = 'https://github.com/join';
    await page.goto(pageUrl);

    await wait(1000);

    const usernameSelector = 'input#user_login';
    const emailSelector = 'input#user_email';
    const passwordSelector = 'input#user_password';
    const originUsername = username;
    const originPassword = password;
    let usernameSalt;
    let passwordSalt;
    while (true) {
        await setInput(page, usernameSelector, username);
        await setInput(page, emailSelector, email);
        await setInput(page, passwordSelector, password);
        await page.click('button#signup_button');
        await page.waitForNavigation();
        if (page.url() !== pageUrl) break;

        let usernameUpdate = changeUsername(originUsername, usernameSalt);
        usernameSalt = usernameUpdate.salt;
        username = usernameUpdate.username(originUsername, usernameSalt);
        console.log('change username to: ', username);
        
        let passwordUpdate = changePassword(originPassword, passwordSalt);
        passwordSalt = passwordUpdate.salt;
        password = passwordUpdate.password(originPassword, passwordSalt);
        console.log('change password to: ', password);
    }

    await page.click('button.js-choose-plan-submit');
    await page.waitForNavigation();

    const input1 = 'form.setup-form > fieldset:nth-of-type(1) input';
    const input2 = 'form.setup-form > fieldset:nth-of-type(2) input';
    const input3 = 'form.setup-form > fieldset:nth-of-type(3) input';
    const input4 = 'form.setup-form > fieldset:nth-of-type(4) input[type="text"]';
    await page.click(input1);
    await page.click(input2);
    await page.click(input3);
    await page.type(input4, 'web-development machine-learning ');
    await page.click('form.setup-form > input.btn-primary[name="commit"]');

    await page.waitForNavigation();
    if (page.url() === 'https://github.com/dashboard') {
        console.log('success: ', {
            username,
            password,
            email
        });
    }
};
