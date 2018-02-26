import ObjectStringify from '../src/stringify.mjs';

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
    })
};
