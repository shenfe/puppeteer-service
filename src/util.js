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

const wait = d => {
    return new Promise(resolve => setTimeout(_ => resolve(1), d));
};

module.exports = {
    evaluate,
    walk,
    wait
};
