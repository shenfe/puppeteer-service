let port;

const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    switch (val) {
    case '-p':
        port = +args[index + 1];
        break;
    }
});

const index = require('../src');

(async () => {
    const { koaApp, server } = await index({
        ...(port && { port }),
        puppeteer: {
            headless: false,
            // executablePath: './node_modules/puppeteer/.local-chromium/mac-526987/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
            executablePath: 'D:\\programs\\shenfe\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe'
        }
    });
    // do stuff
})();
