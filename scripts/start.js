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

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (!useCluster) {
    run();
} else {
    // Go through all workers
    function eachWorker(callback) {
        for (const id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    }
    // Kill all workers
    function closeWorkers() {
        eachWorker(worker => {
            worker.send('master:close');
        });
    }

    if (cluster.isMaster) {
        console.log(`主进程 ${process.pid} 正在运行`);
        process.on('exit', () => {
            console.log(`主进程 ${process.pid} 在退出`);
        });

        // 衍生工作进程
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log('工作进程 %d 退出: exitedAfterDisconnect (%s), signal (%s), code (%s)',
                worker.process.pid,
                worker.exitedAfterDisconnect,
                signal,
                code);
            if (code === 0) {
                console.log('即将关闭所有工作进程');
                closeWorkers();
                let workerCount = Object.keys(cluster.workers).length;
                console.log(`剩余 ${workerCount} 个工作进程`);
                if (!workerCount) process.exit(); // exit the master process
            } else {
                console.log('重启工作进程...');
                cluster.fork();
            }
        });
    } else {
        run();
        console.log(`工作进程 ${process.pid} 已启动`);
        process.on('exit', () => {
            console.log(`工作进程 ${process.pid} 在退出`);
        });
        process.on('message', (msg) => {
            if (msg === 'master:close') {
                console.log(`主进程告知工作进程 ${process.pid} 退出`);
                process.exit();
            }
        });
    }
}
