process.env.NODE_ENV = 'test';

const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    SOCKETS = require('../../shared/socket.io/events'),
    { createFooConnection } = require('./helpers');

chai.use(chaiAsPromised);
chai.should();

describe('SocketIO user events', () => {
    let fooUser, fooClient;

    beforeEach(done => {
        createFooConnection((user, client) => {
            fooUser = user;
            fooClient = client;
            done();
        });
    });

    afterEach(() => {
        if (fooClient.connected)
            fooClient.disconnect();
    });

    it('should return user by id', done => {
        fooClient.on(SOCKETS.USER, ({ user }) => {
            user.id.should.equal(fooUser._id.toString());
            user.username.should.equal(fooUser.username);
            done();
        });
        fooClient.emit(SOCKETS.USER, { userId: fooUser._id });
    });

    it('should add email to user profile', done => {
        const expectedEmail = 'foo@bar.com',
            editedUser = Object.assign({}, fooUser, {
                id: fooUser._id.toString(),
                email: expectedEmail
            });

        fooClient.on(SOCKETS.EDIT_USER, ({ user }) => {
            user.email.should.equal(expectedEmail);
            done();
        });


        fooClient.emit(SOCKETS.EDIT_USER, { user: editedUser });
    });
});
