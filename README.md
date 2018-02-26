# puppeteer-service

(IN DEVELOPMENT...)

Make puppeteer run as a service.

## Usage

### server

```bash
npm start
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

## License

MIT
