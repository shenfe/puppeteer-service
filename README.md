# puppeteer-service <a href="https://www.npmjs.com/package/puppeteer-service"><img src="https://img.shields.io/npm/v/puppeteer-service.svg"></a>

<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" height="200" align="right">

Run [GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer) as a service.

## Installation

```bash
$ npm install puppeteer-service --save
```

## Usage

### server

```js
const PuppeteerService = require('puppeteer-service');
const { koaApp, server } = PuppeteerService({
    port: 3000, // default
    api: 'run', // default
    puppeteer: {
        // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    }
});
```

### client

Use the sub-module named `request` to communicate with the server. It's runnable at **both browser and Node.js**.

```js
const Run = require('puppeteer-service/request.mjs');
Run('http://your-server.com:3000/run', {
    /* Entry page url */
    url: 'https://www.sogou.com',

    /* Runner function */
    run: async page => {
        const title = await page.title();
        return {
            info: b(a, title)
        };
    },

    /* Options */
    options: {
        /* Variables to inject */
        /* Identifiers and their corresponding literal values will be injected 
            as variable declarations into the runner function. */
        injection: {
            a: 'Welcome to ',
            b: function (x, y) {
                return x + y;
            }
        }
    }
})
    .then(data => {
        /**/
    }).catch(error => {
        /**/
    });
```

Or **send an HTTP request directly**, as the following does:

```js
fetch('http://your-server.com:3000/run', {
    method: 'POST',
    /*...*/
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        data: `{
            url: 'https://www.sogou.com',
            run: async page => {
                const title = await page.title();
                return {
                    info: b(a, title)
                };
            },
            options: {
                injection: {
                    a: 'Welcome to ',
                    b: function (x, y) {
                        return x + y;
                    }
                }
            }
        }`
    })
})
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('Response is not ok');
    })
    .then(data => {
        /**/
    }).catch(error => {
        /**/
    });
```

## Development

```bash
$ npm start # Start
$ npm run debug # Start in debugging mode
$ npm stop # Stop
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright © 2018-present, [shenfe](https://github.com/shenfe)
