const fnsb = require('function-sandbox');

const evaluate = str => {
    return fnsb(new Function(`return (${str})`), true)();
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

const wait = d => {
    return new Promise(resolve => setTimeout(_ => resolve(1), d));
};

module.exports = {
    evaluate,
    walk,
    wait
};
