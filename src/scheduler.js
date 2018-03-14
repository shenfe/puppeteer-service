const EventEmitter = require('events').EventEmitter;

const PageBroker = function (browser, options = {}) {
    const usePagePool = !!options.pooling;
    const maxSize = 100;
    const minSize = 10;
    const limit = (typeof options.limit === 'number' && !isNaN(options.limit) && options.limit >= minSize) ? options.limit : maxSize;
    const pool = [];
    const event = new EventEmitter();
    return {
        open: async () => {
            if (!usePagePool) {
                return {
                    page: await browser.newPage()
                };
            }
            if (pool.length < limit) {
                let page = await browser.newPage();
                pool.push({
                    page,
                    status: 0
                });
                return { page, id: pool.length - 1 };
            }
            return new Promise((resolve, reject) => {
                for (let id = 0, len = pool.length; id < len; id++) {
                    if (pool[id].status === 0) {
                        pool[id].status = 1;
                        resolve({ page: pool[id].page, id });
                        return;
                    }
                }
                event.on('page_close', function listener(page, id) {
                    if (pool[id].status === 0) {
                        pool[id].status = 1;
                        this.removeListener('page_close', listener);
                        resolve({ page, id });
                    }
                });
            });
        },
        close({ page, id }) {
            if (!usePagePool) return page.close();
            return page.goto('about:blank').then(_ => {
                pool[id].status = 0;
                event.emit('page_close', page, id);
                return page;
            });
        }
    };
};

module.exports = {
    PageBroker
};
