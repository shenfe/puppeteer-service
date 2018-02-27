# puppeteer-service

<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" height="200" align="right">

Run [GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer) as a service.

## Installation

```bash
$ npm install --save puppeteer-service
```

## Usage

### server

```js
const PuppeteerService = require('puppeteer-service');
const app = PuppeteerService({
    port: 3000,
    api: 'run'
});
```

### client

> Both the browser and Node.js are applicable.

```js
const Run = require('puppeteer-service/request.mjs');
Run('http://your-server.com:3000/run', {
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
})
    .then(data => {
        /**/
    }).catch(error => {
        /**/
    });
```

## Development

```bash
$ npm run debug # Debug
$ npm test # Test
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright © 2018-present, [shenfe](https://github.com/shenfe)
