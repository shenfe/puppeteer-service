const accountList = require('./accounts.0');

const accountToSignin163 = () => {
    let { email, password } = accountList.find(item => (item.email && item.email.endsWith('@163.com')));
    return {
        username: /([^@]*).*/.exec(email)[1],
        password: password
    };
};

const accountToSigninGithub = () => {
    let a = accountList.find(item => item.github);
    return a && a.github;
};

const accountToSignupGithub = () => {
    let { email, password } = accountList.find(item => !item.github);
    return {
        username: /([a-zA-Z]+)[0-9]*@.*/.exec(email)[1],
        password: password,
        email: email
    };
};

module.exports = {
    accountToSignin163,
    accountToSigninGithub,
    accountToSignupGithub
};
