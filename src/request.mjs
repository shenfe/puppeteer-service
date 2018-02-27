import ObjectStringify from '../src/stringify.mjs';

const detectNodejs = (function () {
    return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
})();

if (detectNodejs) {
    global.fetch = require('node-fetch');
}

export default (url, data = {}, options = {}) => {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        ...options,
        body: JSON.stringify({
            data: ObjectStringify(data)
        })
    }).then(res => {
        if (res.ok) return res.json();
        throw new Error('Response is not ok');
    });
};
