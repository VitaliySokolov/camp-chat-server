const
    _ = require('lodash'),
    User = require('../models/user'),
    Room = require('../models/room'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('./constants'),
    ChatSocket = require('./chat-socket');

ChatSocket.prototype.chatUsersHandler = function ({ userId }) {
    User
        .findById(userId)
        .select({ hashedPassword: 0, salt: 0, __v: 0 })
        .lean()
        .then(user => {
            user = this.formatUser(user);
            this.socket.emit(SOCKETS.USER, { user });
        }).catch(err => console.error(err));
};

ChatSocket.prototype.editUsersHandler = function ({ user }) {
    const sender = this.socket.decoded_token;

    if (sender.id !== user.id)
        return this.sendError(SOCKETS.ERROR_NO_PERMISSION);
    return User
        .findById(user.id)
        .then(userInDb => {
            if (user.username)
                userInDb.username = user.username;
            if (user.email)
                userInDb.email = user.email;
            if (user.avatar)
                userInDb.avatar = user.avatar;
            userInDb.editedAt = Date.now();
            userInDb
                .save()
                .then(savedUser => {
                    this.socket.broadcast.emit(SOCKETS.EDIT_USER, { user: savedUser });
                    this.socket.emit(SOCKETS.EDIT_USER, { user: savedUser, self: true });
                })
                .catch(error => {
                    console.error(error);
                    this.sendError(CONSTANTS.DB_ERROR);
                });
        });
};

ChatSocket.prototype.formatUsers = function (users) {
    return users.map(user => this.formatUser(user));
};

ChatSocket.prototype.formatUser = function (user) {
    let online = false;
    const id = user._id.toString();

    user = _.omit(user, '_id');
    if (this.getSocketId(id))
        online = true;
    return Object.assign({}, user,
        { id, online });
};

ChatSocket.prototype.listUsersHandler = function () {
    User
        .find({})
        .select({ hashedPassword: 0, salt: 0, __v: 0 })
        .lean()
        .then(users => {
            users = this.formatUsers(users);
            this.socket.emit(SOCKETS.USERS, { users });
        }).catch(err => console.error(err));
};

ChatSocket.prototype.listRoomUsersHandler = function ({ roomId }) {
    Room
        .findById(roomId)
        .select('users')
        .populate('users', { hashedPassword: 0, salt: 0, __v: 0 })
        .lean()
        .then(room => {
            const users = this.formatUsers(room.users);

            this.socket.emit(SOCKETS.USERS, { roomId, users });
        });
};

module.exports = { };

