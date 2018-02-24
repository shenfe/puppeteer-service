const puppeteer = require('puppeteer');

const sleep = function (d) {
    for (let t = Date.now(); Date.now() - t <= d;);
}

/**
 * @return {!Promise<?Puppeteer.Frame>}
 * @link https://github.com/GoogleChrome/puppeteer/issues/433
 */
const getFrame = async function () {
    const nodeInfo = await this._client.send('DOM.describeNode', {
        objectId: this._remoteObject.objectId
    }).catch(error => void debugError(error));

    if (typeof nodeInfo.node.frameId === 'string') {
        for (const frame of this._page.frames()) {
            if (nodeInfo.node.frameId === frame._id) return frame;
        }
        return null;
    } else {
        return null;
    }
};

module.exports = async ({
    username,
    password
}) => {
    puppeteer.launch({
        headless: false,
        executablePath: '../spiderman/node_modules/puppeteer/.local-chromium/win64-526987/chrome-win32/chrome.exe'
    }).then(async browser => {
        const page = await browser.newPage();
        await page.goto('https://mail.163.com/');

        sleep(3000);

        const iframe = await page.$('iframe');
        const frame = await getFrame.call(iframe);

        await frame.type('#login-form > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > input:nth-of-type(1)', username);
        await frame.type('#login-form > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(2) > input:nth-of-type(2)', password);
        await frame.click('#dologin');

        setTimeout(async () => {
            const result = await page.evaluate(x => {
                let q = document.body.querySelectorAll('.mboxlst');
                return q[q.length - 1].innerText;
            }, 7);
            console.log(result);

            await browser.close();
        }, 3000);
    });
};
