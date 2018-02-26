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

export default ObjectStringify;
