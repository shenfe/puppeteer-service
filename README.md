# puppeteer-service <a href="https://www.npmjs.com/package/puppeteer-service"><img src="https://img.shields.io/npm/v/puppeteer-service.svg"></a>

<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" height="200" align="right">

Run [GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer) as a service.

## Usage

### Server

```bash
$ npm install puppeteer-service --save
```

```js
const PuppeteerService = require('puppeteer-service');
const { koaApp, server } = PuppeteerService({
    cluster: true, // default
    port: 3000, // default
    api: 'run', // default
    test: true, // default: false
    puppeteer: {
        // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
        headless: true, // default
        args: ['--no-sandbox']
    }
});
```

😯 If the `test` option is set `true` like above, you can visit the test page via `http://your.host:3000/test/`.

### Client

#### 👉 Option 1: Use puppeteer-service-client

```bash
$ npm install puppeteer-service-client --save
```

Use [puppeteer-service-client](https://github.com/shenfe/puppeteer-service-client) to communicate with the server. It's runnable at **both browser and Node.js**.

```js
const Run = require('puppeteer-service-client');
Run('http://your.host:3000/run', {
    /* Entry page url */
    url: 'https://target.com/',

    /* Runner function */
    run: async page => {
        const title = await page.title();
        echo({ url: page.url(), title });
        return {
            info: b(a, title)
        };
    },

    /* Options (Optional) */
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
    },

    /* WebSocket data handler (Optional) */
    socket: data => {
        /**/
    }
})
    .then(data => {
        /**/
    }).catch(error => {
        /**/
    });
```

**socket and echo**

The `socket` option specifies a handler for WebSocket data at client side. Correspondingly, the function `echo`, which is callable inside the "page runner function", is a built-in function whose responsibility is to transfer data to the right socket connection with the client.

#### 👉 Option 2: Send a request directly

As the following does:

```js
const pageRunner = async page => {
    const title = await page.title();
    return {
        info: b(a, title)
    };
};
fetch('http://your.host:3000/run', {
    method: 'POST',
    /*...*/
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        data: `{
            url: 'https://www.sogou.com',
            run: ${pageRunner},
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

⚠️ This way is lightweight but too simple to communicate with the server via WebSocket.

## Development

Some commands:

```bash
npm start # start
npm start -- -p 3000 # port
npm start -- -c # cluster
npm run debug # debugging mode
npm test # test
npm test -- -u http://127.0.0.1:3000/run # api url
npm test -- -n 10 # batch number
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright © 2018-present, [shenfe](https://github.com/shenfe)
