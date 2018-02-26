const list = require('../accounts/list0');

const account = list.find(item => !item.github);

module.exports = {
    username: /([a-zA-Z]+)[0-9]*@.*/.exec(account.username)[1],
    password: account.password,
    email: account.username
};
