process.env.NODE_ENV = 'test';

// const chai = require('chai');
// const mocha = require('mocha');
// const should = chai.should();

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const serverPromise = require('../server/server');

const config = require('../server/config');
const serverURL = `http://localhost:${config.port}`;

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const User = require('../server/models/user');
const Message = require('../server/models/message');

const socketOptions = {
    transport: ['websocket'],
    'force new connection': true
};

const createUser = (userName, userPass) => User
        .remove({ username: userName })
        .then(() => new User({
            username: userName,
            password: userPass
        })
                .save());

// const connectUser = (userName, userPass) => {
//   return new Promise((resolve, reject) => {
//     createUser(userName, userPass)
//       .then(user => {
//         const userObj = {
//           id: user.id,
//           username: user.username
//         };
//         const token = jwt.sign(
//           userObj,
//           config.jwtSectet,
//           { noTimestamp: true }
//         );

//         client = io.connect(
//           serverURL,
//           socketOptions);
//         client.on("connect", () => {
//           client.emit('authenticate', { token });
//           resolve(user, client)
//         });
//       });
//   })
// }

const createMessage = (user, msgText, daysAgo) => {
    if (!daysAgo)
        daysAgo = 0;

    const d = new Date();

    return new Message({
        text: msgText,
        author: user.id,
        sentAt: d.setDate(d.getDate() - daysAgo)
    })
        .save();
};

describe('SocketIO connection', () => {
    let client, fooUser;

    before(done => {
        serverPromise.then(() => {
            done();
        });
    });

    beforeEach(done => {
        createUser('foo', 'bar')
            .then(user => {
                fooUser = user;
                const userObj = {
                    id: user.id,
                    username: user.username
                };
                const token = jwt.sign(
                    userObj,
                    config.jwtSectet,
                    { noTimestamp: true }
                );

                client = io.connect(
                    serverURL,
                    socketOptions);
                client.on('connect', () => {
                    client.emit('authenticate', { token });
                    done();
                });
            });
    });

    afterEach(done => {
        if (client.connected)
            client.disconnect();

        User.remove().then(() => {
            done();
        });
    });

    it('should not authenticate user with wrong token', done => {
        // client.disconnect();
        const client2 = io.connect(serverURL, socketOptions);

        client2.on('connect', () => {
            client2.once('unauthorized', () => {
                done();
            });
            client2.emit('authenticate', { token: 'wrong token' });
        });
    });

    it('should authenticate user', done => {
        client
            .once('authenticated', () => {
                // console.log('auth ok');
                done();
            });
    });

    it('should join chat', done => {
        client.once('join', data => {
            data.user.username.should.equal(fooUser.username);
            done();
        });
    });

    it('should leave chat', done => {
        const barUser = { username: 'bar' };
        const barToken = jwt.sign(
            barUser,
            config.jwtSectet,
            { noTimestamp: true }
        );

        client.once('leave', data => {
            data.user.username.should.equal(barUser.username);
            done();
        });

        const newClient = io.connect(serverURL, socketOptions);

        newClient.on('connect', () => {
            newClient.once('join', () => {
                newClient.disconnect();
            });
            newClient.emit('authenticate', { token: barToken });
        });
    });

    describe('`messages`', () => {
        afterEach(done => {
            Promise
                .all([
                    Message.remove(),
                    User.remove()
                ])
                .then(() => done());
        });

        it('should send message', done => {
            const expectedMessage = 'hello world';

            client.on('message', data => {
                data.msg.should.equal(expectedMessage);
                done();
            });
            client.once('join', () => {
                client.emit('message', expectedMessage);
            });
        });

        it('should receive empty array of messages', done => {
            client.on('messages', data => {
                data.should.deep.equal([]);
                done();
            });
            Message
                .remove()
                .then(() => client.emit('get messages'));
        });

        it('should receive one message', done => {
            const expectedAuthor = fooUser.username;
            const expectedMessage = 'hello foo';

            client.on('messages', data => {
                data[0].msg.should.equal(expectedMessage);
                data[0].user.username.should.equal(expectedAuthor);
                done();
            });
            createMessage(fooUser, expectedMessage)
                .then(() => client.emit('get messages'));
        });

        it('should not receive newer than cutoff', done => {
            const expectedMessage = 'hello foo';

            client.on('messages', data => {
                data.should.deep.equal([]);
                done();
            });
            createMessage(fooUser, expectedMessage, 2)
                .then(() => {
                    const d = new Date();

                    client.emit('get messages',
                        { cutoff: d.setDate(d.getDate() - 3) });
                });
        });

        it('should receive too old messages when request them', done => {
            const expectedAuthor = fooUser.username;
            const expectedMessage = 'hello foo';

            client.on('messages', data => {
                data[0].msg.should.equal(expectedMessage);
                data[0].user.username.should.equal(expectedAuthor);
                done();
            });
            createMessage(fooUser, expectedMessage, 2)
                .then(() => {
                    const d = new Date();

                    client.emit('get messages',
                        { cutoff: d.setDate(d.getDate() - 1) });
                });
        });

        it('should edit message', done => {
            const initialMessage = 'hi foo';
            const expectedMessage = 'hello foo';
            let expectedMessageId;

            client.on('message_changed', data => {
                data.id.should.equal(expectedMessageId);
                data.text.should.equal(expectedMessage);
                done();
            });

            createMessage(fooUser, initialMessage)
                .then(msg => {
                    msg.text.should.equal(initialMessage);
                    expectedMessageId = msg.id;
                    client.emit('put message',
                        { msgId: msg.id, msgText: expectedMessage });
                });
        });

        it('should delete message', done => {
            const initialMessage = 'hi foo';
            let expectedMessageId;

            client.on('message_deleted', data => {
                data.id.should.equal(expectedMessageId);
                done();
            });

            createMessage(fooUser, initialMessage)
                .then(msg => {
                    expectedMessageId = msg.id;
                    client.emit('delete message',
                        { msgId: msg.id });
                });
        });
    });
});
