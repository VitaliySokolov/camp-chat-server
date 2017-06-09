process.env.NODE_ENV = 'test';

const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    User = require('../../server/models/user'),
    Message = require('../../server/models/message'),
    io = require('socket.io-client'),
    jwt = require('jsonwebtoken'),
    config = require('../../server/config'),
    serverURL = `http://localhost:${config.port}`,
    { createFooConnection,
        createBarConnection,
        createUser } = require('./helpers');

chai.use(chaiAsPromised);
chai.should();

const socketOptions = { transport: ['websocket'], 'force new connection': true };

describe('SocketIO connection', () => {
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

    afterEach(done => {
        if (fooClient.connected)
            fooClient.disconnect();
        if (barClient.connected)
            barClient.disconnect();
        Promise
            .all([
                Message.remove(),
                User.remove()
            ])
            .then(() => done());
    });


    it('should not authenticate user with wrong token', done => {
        const bazClient = io.connect(serverURL, socketOptions);

        bazClient.on('connect', () => {
            bazClient.once('unauthorized', () => {
                done();
            });
            bazClient.emit('authenticate', { token: 'wrong token' });
        });
    });

    it('should authenticate user', done => {
        createUser('baz', 'bazpass')
            .then(user => {
                const userObj = {
                        id: user.id,
                        username: user.username
                    },
                    token = jwt.sign(
                        userObj,
                        config.jwtSectet,
                        { noTimestamp: true }
                    );

                const client = io.connect(
                    serverURL,
                    socketOptions);

                client.on('connect', () => {
                    client.emit('authenticate', { token });
                });
                client.once('authenticated', () => {
                    done();
                });
            });
    });

    it('should join chat', done => {
        createUser('baz', 'bazpass')
            .then(user => {
                const userObj = {
                        id: user.id,
                        username: user.username
                    },
                    token = jwt.sign(
                        userObj,
                        config.jwtSectet,
                        { noTimestamp: true }
                    );

                const client = io.connect(
                    serverURL,
                    socketOptions);

                client.on('connect', () => {
                    client.emit('authenticate', { token });
                });
                client.once('join', data => {
                    data.user.username.should.equal('baz');
                    done();
                });
            });
    });

    it('should leave chat', done => {
        fooClient.once('leave', data => {
            data.user.username.should.equal(barUser.username);
            done();
        });

        barClient.disconnect();
    });
});
