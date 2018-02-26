const fnsb = require('function-sandbox');

const evaluate = str => {
    return (new Function(`return ${str}`))();
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

const ObjectParse = str => {
    if (typeof str !== 'string') return str;

    let obj;
    try {
        obj = evaluate(str);
    } catch (e) {
        console.error(e);
    }

    walk(obj, (target, p, v) => {
        if (typeof v === 'function') {
            target[p] = fnsb(v, true);
        }
    });

    return obj;
};

const ObjectStringify = obj => {
    switch (Object.prototype.toString.call(obj)) {
    case '[object Function]':
    case '[object AsyncFunction]':
        return obj.toString();
    case '[object Object]':
        let p = [];

        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            p.push([i, ObjectStringify(obj[i])]);
        }

        return '{' + p.map(v => `${JSON.stringify(v[0])}:${v[1]}`).join(',') + '}';

    case '[object Array]':
        return '[' + obj.map(ObjectStringify).join(',') + ']';

    default:
        return JSON.stringify(obj);
    }
};

module.exports = {
    walk,
    ObjectParse,
    ObjectStringify
};
