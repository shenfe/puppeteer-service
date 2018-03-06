let port;

let useCluster = false;

const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    switch (val) {
    case '-p':
    case '--port':
        port = +args[index + 1];
        break;
    case '-c':
    case '--cluster':
        useCluster = true;
        break;
    }
});

const index = require('../src');

const run = () => index({
    test: true,
    ...(port && { port }),
    puppeteer: {
        // headless: false,
        executablePath: '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe'
    }
}).then(({ koaApp, server }) => {
    // do stuff
});

const clusterRunner = require('../src/cluster');

if (!useCluster) {
    run();
} else {
    clusterRunner(run);
}
