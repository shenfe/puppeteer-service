# puppeteer-service

<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" height="200" align="right">

Make puppeteer run as a service.

## Installation

```bash
$ npm install --save puppeteer-service
```

## Usage

### server

```js
const PuppeteerService = require('puppeteer-service');
const app = PuppeteerService({
    port: 3000
});
```

### client

```js
const Run = require('puppeteer-service/request.mjs');
Run('//127.0.0.1:3000/run', {
    url: 'https://www.sogou.com',
    run: async page => {
        const title = await page.title();
        return {
            title: title
        };
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
$ npm test # Test
```

## License

MIT
