process.env.NODE_ENV = 'test';

const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    User = require('../../server/models/user'),
    Message = require('../../server/models/message'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('../../server/sockets/constants'),
    { createFooConnection,
        createMessage } = require('./helpers');

chai.should();
chai.use(chaiAsPromised);

describe('SocketIO message events', () => {
    let fooUser, fooClient;

    beforeEach(done => {
        createFooConnection((user, client) => {
            fooUser = user;
            fooClient = client;
            done();
        });
    });

    beforeEach(done => {
        Message.remove().then(() => done());
    });

    afterEach(done => {
        if (fooClient.connected)
            fooClient.disconnect();
        Promise
            .all([
                Message.remove(),
                User.remove()
            ])
            .then(() => done());
    });

    it('should send message', done => {
        const expectedMessage = 'hello world';

        fooClient.on(SOCKETS.MESSAGE, data => {
            data.msg.should.equal(expectedMessage);
            done();
        });

        fooClient.emit(SOCKETS.MESSAGE, expectedMessage);
    });

    it('should receive empty array of messages', done => {
        fooClient.on(SOCKETS.MESSAGES, data => {
            data.roomId.should.equal(0);
            data.messages.should.deep.equal([]);
            done();
        });
        Message
            .remove()
            .then(() => fooClient.emit(SOCKETS.MESSAGES));
    });

    it('should receive one message', done => {
        const expectedAuthor = fooUser.username,
            expectedMessage = 'hello foo';

        fooClient.on(SOCKETS.MESSAGES, data => {
            data.messages[0].msg.should.equal(expectedMessage);
            data.messages[0].user.username.should.equal(expectedAuthor);
            done();
        });
        createMessage(fooUser, expectedMessage)
            .then(() => fooClient.emit(SOCKETS.MESSAGES));
    });

    it('should not receive newer than cutoff', done => {
        const expectedMessage = 'hello foo';

        fooClient.on(SOCKETS.MESSAGES, data => {
            data.messages.should.deep.equal([]);
            done();
        });
        createMessage(fooUser, expectedMessage, 2)
            .then(() => {
                const d = new Date();

                fooClient.emit(SOCKETS.MESSAGES,
                    { cutoff: d.setDate(d.getDate() - 3) });
            });
    });

    it('should receive too old messages when request them', done => {
        const expectedAuthor = fooUser.username,
            expectedMessage = 'hello foo';

        fooClient.on(SOCKETS.MESSAGES, data => {
            data.messages[0].msg.should.equal(expectedMessage);
            data.messages[0].user.username.should.equal(expectedAuthor);
            done();
        });
        createMessage(fooUser, expectedMessage, 2)
            .then(() => {
                const d = new Date();

                fooClient.emit(SOCKETS.MESSAGES,
                    { cutoff: d.setDate(d.getDate() - 1) });
            });
    });

    it('should edit message', done => {
        const initialMessage = 'hi foo',
            expectedMessage = 'hello foo';
        let expectedMessageId;

        fooClient.on(SOCKETS.EDIT_MESSAGE, data => {
            data.id.should.equal(expectedMessageId);
            data.text.should.equal(expectedMessage);
            done();
        });

        createMessage(fooUser, initialMessage)
            .then(msg => {
                msg.text.should.equal(initialMessage);
                expectedMessageId = msg.id;
                fooClient.emit(SOCKETS.EDIT_MESSAGE,
                    { msgId: msg.id, msgText: expectedMessage });
            });
    });

    it('should not delete message when user is not the author', done => {
        const initialMessage = 'hi foo';

        fooClient.on(SOCKETS.ERROR_MESSAGE, data => {
            data.error.should.equal(CONSTANTS.ERROR_NO_PERMISSION);
            done();
        });

        new User({ username: 'bar', password: 'barpass' })
            .save()
            .then(user => {
                createMessage(user, initialMessage)
                    .then(msg => {
                        fooClient.emit(SOCKETS.DELETE_MESSAGE,
                            { msgId: msg.id });
                    });
            });
    });

    it('should delete message', done => {
        const initialMessage = 'hi foo';
        let expectedMessageId;

        fooClient.on(SOCKETS.DELETE_MESSAGE, data => {
            data.id.should.equal(expectedMessageId);
            done();
        });

        createMessage(fooUser, initialMessage)
            .then(msg => {
                expectedMessageId = msg.id;
                fooClient.emit(SOCKETS.DELETE_MESSAGE,
                    { msgId: msg.id });
            });
    });
});
