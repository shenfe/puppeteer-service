const list = require('./accounts.0');

const account = list[0];

module.exports = {
    username: /([^@]*).*/.exec(account.username)[1],
    password: account.password
};