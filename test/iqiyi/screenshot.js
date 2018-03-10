const { wait } = require('../../src/util');

const path = require('path');

function getScrollbarWidth() {
    let outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';

    document.body.appendChild(outer);

    let widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = 'scroll';

    // add innerdiv
    let inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    let widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

module.exports = async (url, browser) => {
    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.goto(url);

    await wait(1000);

    while (true) {
        let re = await page.evaluate(`(_ => {
            let getScrollbarWidth = ${getScrollbarWidth};
            window.scrollBy(0, window.innerHeight);
            let scrbWidth = getScrollbarWidth();
            return document.body.scrollHeight + scrbWidth === window.innerHeight + window.scrollY;
        })()`);
        await page.waitFor(1000);
        if (re) break;
    }

    const filepath = path.resolve(__dirname, `./screenshots/${Date.now()}.png`);
    await page.screenshot({
        path: filepath,
        fullPage: true
    });

    const result = {
        path: filepath
    };
    console.log(result);

    return result;
};
