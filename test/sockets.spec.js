process.env.NODE_ENV = 'test';

// const mocha = require('mocha');
const chai = require('chai');
// const should = chai.should();
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const io = require('socket.io-client'),
    jwt = require('jsonwebtoken'),
    serverPromise = require('../server/server'),
    config = require('../server/config'),
    serverURL = `http://localhost:${config.port}`,
    mongoose = require('mongoose'),
    User = require('../server/models/user'),
    Message = require('../server/models/message'),
    Room = require('../server/models/room'),
    SOCKETS = require('../shared/socket.io/events'),
    CONSTANTS = require('../server/sockets/constants');

mongoose.Promise = global.Promise;
const socketOptions = { transport: ['websocket'], 'force new connection': true };

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
        createUser('foo', 'foopass')
            .then(user => {
                fooUser = user;
                const userObj = {
                        id: user.id,
                        username: user.username
                    },
                    token = jwt.sign(
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

        Promise
            .all([
                Message.remove(),
                User.remove()
            ])
            .then(() => done());
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

    describe('Messages', () => {
        it('should send message', done => {
            const expectedMessage = 'hello world';

            client.on(SOCKETS.MESSAGE, data => {
                data.msg.should.equal(expectedMessage);
                done();
            });
            client.once('join', () => {
                client.emit(SOCKETS.MESSAGE, expectedMessage);
            });
        });

        it('should receive empty array of messages', done => {
            client.on(SOCKETS.MESSAGES, data => {
                data.roomId.should.equal(0);
                data.messages.should.deep.equal([]);
                done();
            });
            Message
                .remove()
                .then(() => client.emit(SOCKETS.MESSAGES));
        });

        it('should receive one message', done => {
            const expectedAuthor = fooUser.username;
            const expectedMessage = 'hello foo';

            client.on(SOCKETS.MESSAGES, data => {
                data.messages[0].msg.should.equal(expectedMessage);
                data.messages[0].user.username.should.equal(expectedAuthor);
                done();
            });
            createMessage(fooUser, expectedMessage)
                .then(() => client.emit(SOCKETS.MESSAGES));
        });

        it('should not receive newer than cutoff', done => {
            const expectedMessage = 'hello foo';

            client.on(SOCKETS.MESSAGES, data => {
                data.messages.should.deep.equal([]);
                done();
            });
            createMessage(fooUser, expectedMessage, 2)
                .then(() => {
                    const d = new Date();

                    client.emit(SOCKETS.MESSAGES,
                        { cutoff: d.setDate(d.getDate() - 3) });
                });
        });

        it('should receive too old messages when request them', done => {
            const expectedAuthor = fooUser.username,
                expectedMessage = 'hello foo';

            client.on(SOCKETS.MESSAGES, data => {
                data.messages[0].msg.should.equal(expectedMessage);
                data.messages[0].user.username.should.equal(expectedAuthor);
                done();
            });
            createMessage(fooUser, expectedMessage, 2)
                .then(() => {
                    const d = new Date();

                    client.emit(SOCKETS.MESSAGES,
                        { cutoff: d.setDate(d.getDate() - 1) });
                });
        });

        it('should edit message', done => {
            const initialMessage = 'hi foo',
                expectedMessage = 'hello foo';
            let expectedMessageId;

            client.on(SOCKETS.EDIT_MESSAGE, data => {
                data.id.should.equal(expectedMessageId);
                data.text.should.equal(expectedMessage);
                done();
            });

            createMessage(fooUser, initialMessage)
                .then(msg => {
                    msg.text.should.equal(initialMessage);
                    expectedMessageId = msg.id;
                    client.emit(SOCKETS.EDIT_MESSAGE,
                        { msgId: msg.id, msgText: expectedMessage });
                });
        });

        it('should not delete message when user is not the author', done => {
            const initialMessage = 'hi foo';

            client.on(SOCKETS.ERROR_MESSAGE, data => {
                data.error.should.equal(CONSTANTS.ERROR_NO_PERMISSION);
                done();
            });

            new User({ username: 'bar', password: 'barpass' })
                .save()
                .then(user => {
                    createMessage(user, initialMessage)
                        .then(msg => {
                            client.emit(SOCKETS.DELETE_MESSAGE,
                                { msgId: msg.id });
                        });
                });
        });

        it('should delete message', done => {
            const initialMessage = 'hi foo';
            let expectedMessageId;

            client.on(SOCKETS.DELETE_MESSAGE, data => {
                data.id.should.equal(expectedMessageId);
                done();
            });

            createMessage(fooUser, initialMessage)
                .then(msg => {
                    expectedMessageId = msg.id;
                    client.emit(SOCKETS.DELETE_MESSAGE,
                        { msgId: msg.id });
                });
        });
    });
    describe('Rooms', () => {
        let barUser, barClient;


        beforeEach(done => {
            createUser('bar', 'barpass')
                .then(user => {
                    barUser = user;
                    const userObj = {
                            id: user.id,
                            username: user.username
                        },
                        token = jwt.sign(
                            userObj,
                            config.jwtSectet,
                            { noTimestamp: true }
                        );

                    barClient = io.connect(
                        serverURL,
                        socketOptions);
                    barClient.on('connect', () => {
                        barClient.emit('authenticate', { token });
                        Room.remove(() => done());
                    });
                });
        });

        afterEach(done => {
            if (barClient.connected)
                barClient.disconnect();
            Room.remove(() => done());
        });

        it('should list rooms', done => {
            client.on(SOCKETS.ROOMS, ({ rooms }) => {
                rooms.should.deep.equal([]);
                done();
            });
            Room.remove().then(() =>
                client.emit(SOCKETS.ROOMS));
        });

        it('should add room', done => {
            const expectedTitle = 'new room';

            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                room.title.should.equal(expectedTitle);
                room.users.should.contain(fooUser.id);
                room.users.should.not.contain(barUser.id);
                done();
            });
            client.emit(SOCKETS.ADD_ROOM, { title: expectedTitle });
        });

        it('should list one room', done => {
            const expectedTitle = 'new room',
                expectedRoomNumber = 1;
            let expectedRoomId;

            client.on(SOCKETS.ROOMS, ({ rooms }) => {
                rooms.length.should.equal(expectedRoomNumber);
                rooms[0].title.should.equal(expectedTitle);
                rooms[0].id.should.equal(expectedRoomId);
                done();
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                expectedRoomId = room.id;
                client.emit(SOCKETS.ROOMS);
            });
            client.emit(SOCKETS.ADD_ROOM, { title: expectedTitle });
        });

        it('should delete room', done => {
            let expectedRoomId;

            client.on(SOCKETS.DELETE_ROOM, ({ roomId }) => {
                roomId.should.equal(expectedRoomId);
                done();
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                expectedRoomId = room.id;
                client.emit(SOCKETS.DELETE_ROOM, { roomId: expectedRoomId });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should join room', done => {
            client.on(SOCKETS.JOIN_ROOM, ({ user }) => {
                user.id.should.equal(fooUser.id);
                done();
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                client.emit(SOCKETS.JOIN_ROOM, { roomId: room.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should leave room', done => {
            let roomId;

            barClient.on(SOCKETS.LEAVE_ROOM, ({ user }) => {
                user.id.should.equal(fooUser.id);
                done();
            });
            client.on(SOCKETS.JOIN_ROOM, ({ user }) => {
                if (user.id === fooUser.id)
                    client.emit(SOCKETS.LEAVE_ROOM);
            });
            barClient.on(SOCKETS.JOIN_ROOM, () => {
                client.emit(SOCKETS.JOIN_ROOM, { roomId });
            });
            client.on(SOCKETS.INVITE_USER, () => {
                barClient.emit(SOCKETS.JOIN_ROOM, { roomId });
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                roomId = room.id;
                client.emit(SOCKETS.INVITE_USER, { roomId, userId: barUser.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('shoul receive message in room', done => {
            const expectedMessage = 'hello world 2';

            client.on(SOCKETS.MESSAGE, message => {
                message.msg.should.equal(expectedMessage);
                done();
            });

            client.on(SOCKETS.JOIN_ROOM, () => {
                client.emit(SOCKETS.MESSAGE, expectedMessage);
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                client.emit(SOCKETS.JOIN_ROOM, { roomId: room.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should list all users', done => {
            client.on(SOCKETS.USERS, ({ users }) => {
                users.length.should.equal(2);
                done();
            });
            client.emit(SOCKETS.USERS);
        });

        it('should list users in room', done => {
            let roomId;

            client.on(SOCKETS.USERS, ({ users }) => {
                users.length.should.equal(1);
                done();
            });

            client.on(SOCKETS.JOIN_ROOM, () => {
                client.emit(SOCKETS.ROOM_USERS, { roomId });
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                roomId = room.id;
                client.emit(SOCKETS.JOIN_ROOM, { roomId });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should invite user to the room', done => {
            const expectedNumberUsers = 2;
            let expectedRoomId;

            client.on(SOCKETS.INVITE_USER, ({ roomId, userId }) => {
                userId.should.equal(barUser.id);
                roomId.should.equal(expectedRoomId);
                Room
                    .findById(roomId)
                    .then(room => room.users.length)
                    .should.eventually.equal(expectedNumberUsers)
                    .and.notify(done);
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                expectedRoomId = room.id;
                client.emit(SOCKETS.INVITE_USER, { roomId: expectedRoomId, userId: barUser.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should not invite self to the room', done => {
            client.on(SOCKETS.ERROR_MESSAGE, ({ error }) => {
                error.should.equal(CONSTANTS.ERROR_NO_SELF_INVITE);
                done();
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                client.emit(SOCKETS.INVITE_USER, { roomId: room.id, userId: fooUser.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should kick user from the room', done => {
            let expectedRoomId;

            client.on(SOCKETS.KICK_USER, ({ roomId, userId }) => {
                userId.should.equal(barUser.id);
                roomId.should.equal(expectedRoomId);
                Room.findById(roomId).then(room => {
                    room.users.length.should.equal(1);
                    room.users[0].toString().should.equal(fooUser.id);
                }).should.be.fulfilled.and.notify(done);
            });

            client.on(SOCKETS.INVITE_USER, ({ roomId, userId }) => {
                client.emit(SOCKETS.KICK_USER, { roomId, userId });
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                expectedRoomId = room.id;
                client.emit(SOCKETS.INVITE_USER, { roomId: expectedRoomId, userId: barUser.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });

        it('should not kick self from the room', done => {
            client.on(SOCKETS.ERROR_MESSAGE, ({ error }) => {
                error.should.equal(CONSTANTS.ERROR_NO_SELF_KICK);
                done();
            });
            client.on(SOCKETS.ADD_ROOM, ({ room }) => {
                client.emit(SOCKETS.KICK_USER, { roomId: room.id, userId: fooUser.id });
            });
            client.emit(SOCKETS.ADD_ROOM, { title: 'something' });
        });
    });

    describe('Users', () => {
        beforeEach(done => {
            client.on('join', () => {
                done();
            });
        });

        it('should return user by id', done => {
            client.on(SOCKETS.USER, ({user}) => {
                user.id.should.equal(fooUser._id.toString());
                user.username.should.equal(fooUser.username);
                done();
            });
            client.emit(SOCKETS.USER, {userId: fooUser._id});
        });

        it('should add email to user profile', done => {
            const expectedEmail = 'foo@bar.com',
                editedUser = Object.assign({}, fooUser, {
                    id: fooUser._id.toString(),
                    email: expectedEmail
                });

            client.on(SOCKETS.EDIT_USER, ({user}) => {
                user.email.should.equal(expectedEmail);
                done();
            });


            client.emit(SOCKETS.EDIT_USER, {user: editedUser});
        });
    });
});
