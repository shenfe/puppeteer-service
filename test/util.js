const wait = d => new Promise(resolve => setTimeout(_ => resolve(1), d));

module.exports = {
    wait
};
