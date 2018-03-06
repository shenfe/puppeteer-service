module.exports = {
    server: {
        port: 3000,
        apiName: 'run'
    },
    launch: {
        ignoreHTTPSErrors: true,
        headless: true,
        args: [
            '--no-sandbox',
            '--memory-pressure-thresholds=1'
        ]
    }
};
