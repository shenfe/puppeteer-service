const fetch = require('node-fetch');
const config = require('../src/config');
const keyString = require('../src/config/privates').key;

let port;

const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    switch (val) {
    case '-p':
    case '--port':
        port = +args[index + 1];
        break;
    }
});

port = port || config.server.port;

module.exports = fetch(`http://127.0.0.1:${port}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        key: keyString
    })
})
    .then(res => {
        if (res.ok) return res.json().then(console.log);
        console.error('Response of the `stop` request is not ok');
    })
    .catch(err => {
        switch (err.code) {
        case 'ECONNREFUSED':
            console.log('Connection refused');
            break;
        case 'ECONNRESET':
            console.log('Connection aborted');
            break;
        default:
            console.error(err);
            break;
        }
    })
    .then(() => console.log('Stopped'));
