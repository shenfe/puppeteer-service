const list = require('../accounts/list0');

const account = list[0];

module.exports = {
    username: /([^@]*).*/.exec(account.username)[1],
    password: account.password
};
