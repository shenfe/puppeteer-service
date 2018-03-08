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
            '--memory-pressure-thresholds=1',
            '--memory-pressure-off',
            // '--force-fieldtrials=AutomaticTabDiscarding/Disabled',
            '--renderer-process-limit=1000',
            '--v8-cache-strategies-for-cache-storage=aggressive',
            '--aggressive',
            // '--data-path=./browser_data',
            '--disable-renderer-backgrounding'
        ]
    }
};
