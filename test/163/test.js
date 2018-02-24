const accounts = require('./accounts');

const pupConf = require('../../puppeteer.config');

let a = accounts[0];

const runner = require('./signin');

runner(a, pupConf);
