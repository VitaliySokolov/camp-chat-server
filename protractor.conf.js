// Protractor configuration file, see link for more information

/* global jasmine */
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    allScriptsTimeout: 11000,
    specs: [
        './e2e/**/*.e2e-spec.js'
    ],
    capabilities: {
        'browserName': 'chrome'
    },
    directConnect: true,
    baseUrl: 'http://localhost:3000/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print () { }
    },
    beforeLaunch () {
    },
    onPrepare () {
        jasmine.getEnv().addReporter(new SpecReporter());
    }
};
