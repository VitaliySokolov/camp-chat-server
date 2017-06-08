const
    Room = require('../models/room'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('./constants'),
    ChatSocket = require('./chat-socket');

ChatSocket.prototype.listRoomsHandler = function () {
    const user = this.socket.decoded_token;

    Room
        .find({ users: user.id })
        .populate('creator', { hashedPassword: 0, salt: 0, __v: 0 })
        .then(rooms => {
            this.socket.emit('testing', 'hello');
            this.socket.emit(SOCKETS.ROOMS, { rooms });
        });
};

ChatSocket.prototype.addRoomHandler = function ({ title }) {
    const user = this.socket.decoded_token,
        room = new Room({ title, creator: user.id });
    // TODO: must be unique pair title and creator

    room
        .save()
        .then(savedRoom => {
            Room
                .findById(savedRoom.id)
                .populate('creator', { hashedPassword: 0, salt: 0, __v: 0 })
                .then(foundRoom => this.socket.emit(SOCKETS.ADD_ROOM, { room: foundRoom }));
        });
};

ChatSocket.prototype.deleteRoomHandler = function ({ roomId }) {
    const user = this.socket.decoded_token;

    Room
        .findById(roomId)
        .then(room => {
            if (room.creator.toString() !== user.id)
                return this.sendError(CONSTANTS.ERROR_NO_PERMISSION);
            return Room
                .remove({ _id: room.id })
                .then(() => {
                    this.leaveRoomByAllUsers(roomId);
                    this.io.emit(SOCKETS.DELETE_ROOM, { roomId: room.id });
                });
        });
};

ChatSocket.prototype.leaveRoomByAllUsers = function (roomId) {
    const room = this.io.sockets.adapter.rooms[roomId];

    if (room) {
        const socketIds = room.sockets;

        Object
            .keys(socketIds)
            .forEach(localSocketId => {
                const localSocket = this.io.sockets.sockets[localSocketId];

                localSocket.leave(roomId);
                if (localSocket.room === roomId)
                    localSocket.room = '';
            });
    }
};

ChatSocket.prototype.editRoomHandler = function ({ roomId, newTitle }) {
    const user = this.socket.decoded_token;

    if (typeof newTitle !== 'string' || typeof roomId !== 'string')
        return this.sendError(CONSTANTS.ERROR_WRONG_DATA);

    newTitle = newTitle.trim();
    if (newTitle === '')
        return this.sendError(CONSTANTS.ERROR_EMPTY_FIELD);
    return Room
        .findById(roomId)
        .then(room => {
            if (room.creator.toString() !== user.id)
                return this.sendError(CONSTANTS.ERROR_NO_PERMISSION);

            room.title = newTitle;
            room.editedAt = Date.now();
            return room
                .save()
                .then(savedRoom => {
                    Room
                        .findById(savedRoom._id)
                        .populate('creator',
                        { hashedPassword: 0, salt: 0, __v: 0 })
                        .then(foundRoom => {
                            this.io.emit(SOCKETS.EDIT_ROOM,
                                { room: foundRoom });
                        });
                });
        });
};

ChatSocket.prototype.joinRoomHandler = function ({ roomId }) {
    this.userInvited(roomId).then(invited => {
        if (!invited)
            return this.sendError(CONSTANTS.ERROR_NO_PERMISSION);
        this.leaveRoomHandler();
        return this.socket.join(roomId, () => {
            this.socket.room = roomId;
            this.socket.broadcast.to(roomId).emit(SOCKETS.JOIN_ROOM, { user: this.socket.decoded_token });
            this.socket.emit(SOCKETS.JOIN_ROOM, { user: this.socket.decoded_token, self: true });
        });
    });
};

ChatSocket.prototype.userInvited = function (roomId) {
    return Room.find({ _id: roomId, users: this.socket.decoded_token.id }).count();
};

ChatSocket.prototype.leaveRoomHandler = function () {
    if (!this.socket.room)
        return;
    this.socket.leave(this.socket.room, () => {
        this.socket.broadcast.to(this.socket.room).emit(SOCKETS.LEAVE_ROOM, { user: this.socket.decoded_token });
        this.socket.emit(SOCKETS.LEAVE_ROOM, { user: this.socket.decoded_token, self: true });
        this.socket.room = '';
    });
};

ChatSocket.prototype.inviteUserHandler = function ({ roomId, userId }) {
    Room
        .findById(roomId)
        .then(room => {
            if (room.creator.toString() !== this.socket.decoded_token.id)
                return this.sendError(CONSTANTS.ERROR_NO_PERMISSION);
            if (userId in room.users)
                return this.sendError(CONSTANTS.ERROR_WRONG_DATA);
            if (room.creator.toString() === userId)
                return this.sendError(CONSTANTS.ERROR_NO_SELF_INVITE);
            room.users.push(userId);
            return room
                .save()
                .then(savedRoom => {
                    this.socket.emit(SOCKETS.INVITE_USER, { roomId: savedRoom.id, userId });
                    const socketId = this.getSocketId(userId);

                    if (socketId)
                        this.io
                            .to(socketId)
                            .emit(SOCKETS.ADD_ROOM, { room: savedRoom });
                });
        })
        .catch(error => {
            console.error(error);
        });
};

ChatSocket.prototype.kickUserHandler = function ({ roomId, userId }) {
    if (!roomId)
        return this.sendError('common room');
    return Room
        .findById(roomId)
        .then(room => {
            if (room.creator.toString() !== this.socket.decoded_token.id)
                return this.sendError(CONSTANTS.ERROR_NO_PERMISSION);
            if (userId in room.users)
                return this.sendError(CONSTANTS.ERROR_WRONG_DATA);
            if (room.creator.toString() === userId)
                return this.sendError(CONSTANTS.ERROR_NO_SELF_KICK);
            room.users = room.users.filter(user => user.toString() !== userId);
            return room
                .save()
                .then(savedRoom => {
                    this.socket.emit(SOCKETS.KICK_USER, { roomId: savedRoom.id, userId });
                    const socketId = this.getSocketId(userId);

                    if (socketId) {
                        const kickedSocket = this.io.sockets.sockets[socketId];

                        if (kickedSocket.room === roomId)
                            kickedSocket.leave(roomId);

                        this.io
                            .to(socketId)
                            .emit(SOCKETS.DELETE_ROOM, { roomId });
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            console.error(error);
        });
};


module.exports = { };
