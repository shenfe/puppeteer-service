const fs = require('fs');
const path = require('path');

const accountList = require('./accounts.js');

const accountToSignin163 = () => {
    let { username, password } = accountList.find(item => (item.username && item.domain === '163.com'));
    return {
        username,
        password
    };
};

const accountToSigninGithub = () => {
    for (let a of accountList) {
        let r = readAccount(`${a.username}@${a.domain}`);
        if (r.github) return r.github;
    }
};

const accountToSignupGithub = () => {
    for (let a of accountList) {
        if (a.github) continue;
        let r = readAccount(`${a.username}@${a.domain}`);
        if (r.github) continue;
        return {
            username: /([a-zA-Z]+)[0-9]*/.exec(a.username)[1],
            password: a.password,
            email: `${a.username}@${a.domain}`,
            origin: {
                ...a,
                ...r
            }
        };
    }
};

const readFile = filepath => {
    if (!fs.existsSync(filepath)) return {};
    let text = fs.readFileSync(filepath, 'utf8');
    try {
        let obj = JSON.parse(text);
        return obj;
    } catch (e) {
        return {};
    }
};

const writeFile = (filepath, obj = {}) => {
    fs.writeFileSync(filepath, JSON.stringify(obj), 'utf8');
};

const readAccount = email => {
    const filepath = path.resolve(__dirname, `./accounts/${email}.json`);
    return readFile(filepath);
};

const recordAccount = (obj = {}) => {
    if (!obj.email) return false;
    const email = obj.email;
    const filepath = path.resolve(__dirname, `./accounts/${email}.json`);
    writeFile(filepath, Object.assign(readFile(filepath), obj));
};

module.exports = {
    accountToSignin163,
    accountToSigninGithub,
    accountToSignupGithub,
    recordAccount,
    githubRepos: require('./accounts.starRepos')
};
