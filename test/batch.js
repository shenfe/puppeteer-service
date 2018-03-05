const Run = require('puppeteer-service-client');

const { wait } = require('../src/util');

const { port, apiName } = require('../src/config').server;

const batchPromises = [];

console.time('time consumed: ');

for (let i = 0; i < 100; i++) {
    let p = Run(`http://127.0.0.1:${port}/${apiName}?q=${i}`, {
        url: 'https://www.sogou.com/',
        run: async page => {
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
        .then(data => console.log(JSON.stringify(data)))
        .catch(err => console.error(err));
    batchPromises.push(p);
}

Promise.all(batchPromises).then(() => {
    const diff = process.hrtime(time);
    console.timeEnd('time consumed: ');
});
