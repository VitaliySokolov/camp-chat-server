process.env.NODE_ENV = 'test';

const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    Room = require('../../server/models/room'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('../../server/sockets/constants'),
    { createFooConnection, createBarConnection } = require('./helpers');

chai.use(chaiAsPromised);
chai.should();

describe('SocketIO room events', () => {
    let fooUser, fooClient, barUser, barClient;

    beforeEach(done => {
        createFooConnection((user, client) => {
            fooUser = user;
            fooClient = client;
            done();
        });
    });

    beforeEach(done => {
        createBarConnection((user, client) => {
            barUser = user;
            barClient = client;
            done();
        });
    });


    beforeEach(done => {
        Room.remove(() => done());
    });

    afterEach(done => {
        if (fooClient.connected)
            fooClient.disconnect();
        if (barClient.connected)
            barClient.disconnect();
        Room.remove(() => done());
    });

    it('should list rooms', done => {
        fooClient.on(SOCKETS.ROOMS, ({ rooms }) => {
            rooms.should.deep.equal([]);
            done();
        });
        Room.remove().then(() =>
            fooClient.emit(SOCKETS.ROOMS));
    });

    it('should add room', done => {
        const expectedTitle = 'new room';

        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            room.title.should.equal(expectedTitle);
            room.users.should.contain(fooUser.id);
            room.users.should.not.contain(barUser.id);
            done();
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: expectedTitle });
    });

    it('should list one room', done => {
        const expectedTitle = 'new room',
            expectedRoomNumber = 1;
        let expectedRoomId;

        fooClient.on(SOCKETS.ROOMS, ({ rooms }) => {
            rooms.length.should.equal(expectedRoomNumber);
            rooms[0].title.should.equal(expectedTitle);
            rooms[0].id.should.equal(expectedRoomId);
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            expectedRoomId = room.id;
            fooClient.emit(SOCKETS.ROOMS);
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: expectedTitle });
    });

    it('should delete room', done => {
        let expectedRoomId;

        fooClient.on(SOCKETS.DELETE_ROOM, ({ roomId }) => {
            roomId.should.equal(expectedRoomId);
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            expectedRoomId = room.id;
            fooClient.emit(SOCKETS.DELETE_ROOM, { roomId: expectedRoomId });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should edit room', done => {
        const expectedTitle = 'new room',
            originalTitle = 'old room';
        let expectedRoomId;

        fooClient.on(SOCKETS.EDIT_ROOM, ({ room }) => {
            room.title.should.equal(expectedTitle);
            room.id.should.equal(expectedRoomId);
            room.creator.id.should.equal(fooUser._id.toString());
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            expectedRoomId = room.id;
            fooClient.emit(SOCKETS.EDIT_ROOM, { roomId: expectedRoomId, newTitle: expectedTitle });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: originalTitle });
    });

    it('should join room', done => {
        fooClient.on(SOCKETS.JOIN_ROOM, ({ user }) => {
            user.id.should.equal(fooUser.id);
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            fooClient.emit(SOCKETS.JOIN_ROOM, { roomId: room.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should leave room', done => {
        let roomId;

        barClient.on(SOCKETS.LEAVE_ROOM, ({ user }) => {
            user.id.should.equal(fooUser.id);
            done();
        });
        fooClient.on(SOCKETS.JOIN_ROOM, ({ user }) => {
            if (user.id === fooUser.id)
                fooClient.emit(SOCKETS.LEAVE_ROOM);
        });
        barClient.on(SOCKETS.JOIN_ROOM, () => {
            fooClient.emit(SOCKETS.JOIN_ROOM, { roomId });
        });
        fooClient.on(SOCKETS.INVITE_USER, () => {
            barClient.emit(SOCKETS.JOIN_ROOM, { roomId });
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            roomId = room.id;
            fooClient.emit(SOCKETS.INVITE_USER, { roomId, userId: barUser.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should receive message in room', done => {
        const expectedMessage = 'hello world 2';

        fooClient.on(SOCKETS.MESSAGE, message => {
            message.msg.should.equal(expectedMessage);
            done();
        });

        fooClient.on(SOCKETS.JOIN_ROOM, () => {
            fooClient.emit(SOCKETS.MESSAGE, expectedMessage);
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            fooClient.emit(SOCKETS.JOIN_ROOM, { roomId: room.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should list all users', done => {
        fooClient.on(SOCKETS.USERS, ({ users }) => {
            users.length.should.equal(2);
            done();
        });
        fooClient.emit(SOCKETS.USERS);
    });

    it('should list users in room', done => {
        let roomId;

        fooClient.on(SOCKETS.USERS, ({ users }) => {
            users.length.should.equal(1);
            done();
        });

        fooClient.on(SOCKETS.JOIN_ROOM, () => {
            fooClient.emit(SOCKETS.ROOM_USERS, { roomId });
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            roomId = room.id;
            fooClient.emit(SOCKETS.JOIN_ROOM, { roomId });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should invite user to the room', done => {
        const expectedNumberUsers = 2;
        let expectedRoomId;

        fooClient.on(SOCKETS.INVITE_USER, ({ roomId, userId }) => {
            userId.should.equal(barUser.id);
            roomId.should.equal(expectedRoomId);
            Room
                .findById(roomId)
                .then(room => room.users.length)
                .should.eventually.equal(expectedNumberUsers)
                .and.notify(done);
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            expectedRoomId = room.id;
            fooClient.emit(SOCKETS.INVITE_USER, { roomId: expectedRoomId, userId: barUser.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should not invite self to the room', done => {
        fooClient.on(SOCKETS.ERROR_MESSAGE, ({ error }) => {
            error.should.equal(CONSTANTS.ERROR_NO_SELF_INVITE);
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            fooClient.emit(SOCKETS.INVITE_USER, { roomId: room.id, userId: fooUser.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should kick user from the room', done => {
        let expectedRoomId;

        fooClient.on(SOCKETS.KICK_USER, ({ roomId, userId }) => {
            userId.should.equal(barUser.id);
            roomId.should.equal(expectedRoomId);
            Room.findById(roomId).then(room => {
                room.users.length.should.equal(1);
                room.users[0].toString().should.equal(fooUser.id);
            }).should.be.fulfilled.and.notify(done);
        });

        fooClient.on(SOCKETS.INVITE_USER, ({ roomId, userId }) => {
            fooClient.emit(SOCKETS.KICK_USER, { roomId, userId });
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            expectedRoomId = room.id;
            fooClient.emit(SOCKETS.INVITE_USER, { roomId: expectedRoomId, userId: barUser.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });

    it('should not kick self from the room', done => {
        fooClient.on(SOCKETS.ERROR_MESSAGE, ({ error }) => {
            error.should.equal(CONSTANTS.ERROR_NO_SELF_KICK);
            done();
        });
        fooClient.on(SOCKETS.ADD_ROOM, ({ room }) => {
            fooClient.emit(SOCKETS.KICK_USER, { roomId: room.id, userId: fooUser.id });
        });
        fooClient.emit(SOCKETS.ADD_ROOM, { title: 'something' });
    });
});
