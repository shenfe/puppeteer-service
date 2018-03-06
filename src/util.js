const vm = require('vm');

const fnsb = require('function-sandbox');

const evaluate = (str, injection = {}) => {
    const safeFn = fnsb(new Function(`return (${str})`), {
        whiteList: Object.keys(injection)
    });
    const returnVarName = 'result';
    const script = new vm.Script(`${returnVarName} = (${safeFn})()`);
    const sandbox = { ...injection };
    script.runInNewContext(sandbox);
    return sandbox[returnVarName];
};

const walk = (obj, fn) => {
    switch (Object.prototype.toString.call(obj)) {
    case '[object Object]':
        Object.keys(obj).forEach(i => {
            fn(obj, i, obj[i]);
            walk(obj[i], fn);
        });
        break;
    case '[object Array]':
        obj.forEach((v, i) => {
            fn(obj, i, v);
            walk(v, fn);
        });
        break;
    }
};

/**
 * IP Hash
 * https://github.com/indutny/sticky-session/blob/master/lib/sticky/master.js
 */
const ipHash = (function () {
    const seed = (Math.random() * 0xffffffff) | 0;

    return ip => {
        let hash = seed;

        for (let i = 0; i < ip.length; i++) {
            const num = ip[i];

            hash += num;
            hash %= 2147483648;
            hash += hash << 10;
            hash %= 2147483648;
            hash ^= hash >> 6;
        }

        hash += hash << 3;
        hash %= 2147483648;
        hash ^= hash >> 11;
        hash += hash << 15;
        hash %= 2147483648;

        return hash >>> 0;
    };
})();

const wait = d => {
    return new Promise(resolve => setTimeout(_ => resolve(1), d));
};

module.exports = {
    evaluate,
    walk,
    wait,
    ipHash
};
