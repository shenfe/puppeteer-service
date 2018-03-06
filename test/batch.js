let batchNumber = 100;
let apiUrl;
const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    switch (val) {
    case '-u':
    case '--url':
        apiUrl = args[index + 1];
        break;
    case '-n':
    case '--number':
        batchNumber = +args[index + 1];
    }
});

const Run = require('puppeteer-service-client');

const { wait } = require('../src/util');

const { port, apiName } = require('../src/config').server;
if (!apiUrl) {
    apiUrl = `http://127.0.0.1:${port}/${apiName}`;
}

const batchPromises = [];

console.time('time consumed: ');

for (let i = 0; i < batchNumber; i++) {
    console.time(`time ${i} consumed: `);
    let p = Run(`${apiUrl}?q=${i}`, {
        url: 'https://www.sogou.com/',
        run: async page => {
            console.log('page ready');
            echo(`${i} hey ` + page.url());
            const title = await page.title();
            return {
                title: title
            };
        },
        // socket: data => {
        //     console.log('socket', data);
        // },
        options: {
            injection: {
                i,
                wait
            }
        }
    })
        .then(data => {
            console.timeEnd(`time ${i} consumed: `);
            // console.log(JSON.stringify(data));
        })
        .catch(err => console.error(err));
    batchPromises.push(p);
}

Promise.all(batchPromises).then(() => {
    console.timeEnd('time consumed: ');
});
