module.exports = {
    server: {
        port: 3000,
        apiName: 'run'
    },
    launch: {
        ignoreHTTPSErrors: true,
        headless: true,
        // userDataDir: './browser_data',
        args: [
            '--no-sandbox',
            '--memory-pressure-thresholds=1',
            // '--memory-pressure-off',
            // '--force-fieldtrials=AutomaticTabDiscarding/Disabled',
            // '--renderer-process-limit=1000',
            // '--v8-cache-strategies-for-cache-storage=aggressive',
            // '--aggressive',
            // '--user-data-dir',
            // '--disable-renderer-backgrounding',
            // '--disable-javascript',
            // '-incognito',
            // '--aggressive-cache-discard',
            // '--aggressive-tab-discard'
        ]
    }
};
