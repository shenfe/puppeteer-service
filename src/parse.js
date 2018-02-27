const fnsb = require('function-sandbox');

const { evaluate, walk } = require('./util');

const ObjectParse = str => {
    if (typeof str !== 'string') return str;

    let obj;
    try {
        obj = evaluate(str);
    } catch (e) {
        console.error(e);
    }

    // walk(obj, (target, p, v) => {
    //     if (typeof v === 'function') {
    //         target[p] = fnsb(v, true);
    //     }
    // });

    return obj;
};

module.exports = ObjectParse;
