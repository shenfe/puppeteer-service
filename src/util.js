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

const wait = d => new Promise(resolve => setTimeout(_ => resolve(1), d));

module.exports = {
    evaluate,
    walk,
    wait
};
