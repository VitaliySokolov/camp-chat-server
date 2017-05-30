const { browser, element, by } = require('protractor');

describe('chat app', () => {
    const WAIT_FOR_LOGIN_IN_MS = 3000;

    beforeAll(() => {
        browser.waitForAngularEnabled(false);
    });

    beforeEach(() => {
        browser.get('/');
    });

    it('should be root element', () => {
        expect(element(by.css('#root'))).toBeDefined();
    });

    it('should be 2 inputs on login page', () => {
        browser.get('/login');
        expect(element.all(by.css('input')).count()).toBe(2);
    });

    it('should login', done => {
        browser.get('/login');
        element.all(by.css('input')).sendKeys('demo');
        element(by.css('#login')).click();
        setTimeout(() => {
            expect(browser.getCurrentUrl()).toMatch(/\/chats$/);
            done();
        }, WAIT_FOR_LOGIN_IN_MS);
    });
});
