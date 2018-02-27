require = require('@std/esm')(module);

const serverConf = require('./server.mjs').default;

module.exports = {
    server: serverConf,
    launch: {
        headless: false,
        // executablePath: './node_modules/puppeteer/.local-chromium/mac-526987/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
        executablePath: 'D:\\programs\\shenfe\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe'
    }
};
