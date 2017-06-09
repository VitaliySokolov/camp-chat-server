const io = require('socket.io-client'),
    jwt = require('jsonwebtoken'),
    serverPromise = require('../../server/server'),
    config = require('../../server/config'),
    serverURL = `http://localhost:${config.port}`,
    mongoose = require('mongoose'),
    User = require('../../server/models/user'),
    Message = require('../../server/models/message'),
    Room = require('../../server/models/room'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('../../server/sockets/constants');

const socketOptions = { transport: ['websocket'], 'force new connection': true };

function createUser (userName, userPass) {
    return User
        .remove({ username: userName })
        .then(() => new User({
            username: userName,
            password: userPass
        })
            .save())
        .catch(err => console.error(err));
}

function createMessage (user, msgText, daysAgo) {
    if (!daysAgo)
        daysAgo = 0;

    const d = new Date();

    return new Message({
        text: msgText,
        author: user.id,
        sentAt: d.setDate(d.getDate() - daysAgo)
    })
        .save();
}

function createConnection (username, pwd, cb) {
    let dbUser, client;

    serverPromise.then(() => {
        createUser(username, pwd)
            .then(user => {
                dbUser = user;
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
                });
                client.on('join', data => {
                    if (data.user.id === user.id)
                        cb(dbUser, client);
                });
            })
            .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function createFooConnection (cb) {
    createConnection('foo', 'foopass', cb);
}

function createBarConnection (cb) {
    createConnection('bar', 'barpass', cb);
}

module.exports = {
    createUser,
    createMessage,
    createConnection,
    createFooConnection,
    createBarConnection
};
