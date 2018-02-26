require = require('@std/esm')(module);

const ObjectParse = require('../src/parse');
const ObjectStringify = require('../src/stringify.mjs').default;

const obj1 = {};

console.log(ObjectStringify(obj1));

const obj2 = function () {};

console.log(ObjectStringify(obj2));

const obj3 = [];

console.log(ObjectStringify(obj3));

const obj4 = '';

console.log(ObjectStringify(obj4));

const obj5 = 1;

console.log(ObjectStringify(obj5));

obj1['a'] = obj2;
obj1['b'] = obj3;
obj1['c'] = obj4;
obj1['d'] = obj5;

console.log(ObjectStringify(obj1));
const obj6 = ObjectParse(ObjectStringify(obj1));
console.log(ObjectStringify(obj6));
