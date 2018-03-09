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

const run = (ifUseCluster) => index({
    cluster: ifUseCluster,
    test: true,
    ...(port && { port }),
    puppeteer: {
        headless: false,
        executablePath: '..\\spiderman\\node_modules\\puppeteer\\.local-chromium\\win64-526987\\chrome-win32\\chrome.exe'
    }
}).then(({ koaApp, server }) => {
    // do stuff
});

console.log('Starting...');

if (useCluster) {
    // console.log('使用Node的cluster模块会导致session混乱问题。如果想要使用集群，请用不同端口启动多个puppeteer-service，再在更上层根据ip-hash实现分发。');
    run(true);
} else {
    run();
}
