// const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt'),
    config = require('../config.js'),
    User = require('../models/user'),
    Message = require('../models/message'),
    Room = require('../models/room'),
    SOCKETS = require('./constants');

const initSocketIO = io => {
    io.sockets
        .on('connection', socketioJwt.authorize({
            secret: config.jwtSectet,
            callback: false
        }))
        .on('authenticated', socket => {
            io.emit('join', {
                user: socket.decoded_token,
                time: Date.now()
            });

            socket
                .on(SOCKETS.MESSAGE, chatMessageHandler)
                .on(SOCKETS.EDIT_MESSAGE, editMessageHandler)
                .on(SOCKETS.DELETE_MESSAGE, deleteMessageHandler)
                .on(SOCKETS.USERS, listUsersHandler)
                .on(SOCKETS.MESSAGES, listMessagesHandler)
                .on(SOCKETS.ROOMS, listRoomsHandler)
                .on(SOCKETS.ROOM_USERS, listRoomUsersHandler)
                .on(SOCKETS.ADD_ROOM, addRoomHandler)
                .on(SOCKETS.DELETE_ROOM, deleteRoomHandler)
                .on(SOCKETS.JOIN_ROOM, joinRoomHandler)
                .on(SOCKETS.LEAVE_ROOM, leaveRoomHandler)
                .on(SOCKETS.INVITE_USER, inviteUserHandler)
                .on(SOCKETS.DISCONNECT, disconnectHandler);

            function listRoomsHandler () {
                const user = socket.decoded_token;

                Room
                    .find({ users: user.id })
                    .then(rooms => {
                        socket.emit(SOCKETS.ROOMS, { rooms });
                    });
            }

            function listUsersHandler () {
                User
                    .find({})
                    .select({ hashedPassword: 0, salt: 0, __v: 0 })
                    .then(users => {
                        socket.emit(SOCKETS.USERS, { users });
                    });
            }

            function listRoomUsersHandler ({ roomId }) {
                Room
                    .findOne({ roomId })
                    .select('users')
                    .populate('users', { hashedPassword: 0, salt: 0, __v: 0 })
                    .then(room => {
                        socket.emit(SOCKETS.USERS, { users: room.users });
                    });
            }

            function addRoomHandler ({ title }) {
                const user = socket.decoded_token,
                    room = new Room({ title, creator: user.id });

                room
                    .save()
                    .then(savedRoom => {
                        socket.emit(SOCKETS.ADD_ROOM, { room: savedRoom });
                    });
            }

            function deleteRoomHandler ({ roomId }) {
                const user = socket.decoded_token;

                Room
                    .findById(roomId)
                    .then(room => {
                        if (room.creator.toString() !== user.id)
                            return sendError(SOCKETS.ERROR_NO_PERMISSION);
                        Room
                            .remove({ _id: room.id })
                            .then(() => {
                                socket.emit(SOCKETS.DELETE_ROOM, { roomId: room.id });
                            });
                    });
            }

            function joinRoomHandler ({ roomId }) {
                userInvited(roomId).then(invited => {
                    if (!invited)
                        return sendError(SOCKETS.ERROR_NO_PERMISSION);
                    leaveRoomHandler();
                    socket.join(roomId, () => {
                        socket.room = roomId;
                        io.to(roomId).emit(SOCKETS.JOIN_ROOM, { user: socket.decoded_token }
                        );
                    });
                });
            }

            function userInvited (roomId) {
                return Room.find({ _id: roomId, users: socket.decoded_token.id }).count();
            }

            function leaveRoomHandler () {
                if (!socket.room)
                    return;
                socket.leave(socket.room, () => {
                    io.to(socket.room).emit(SOCKETS.LEAVE_ROOM, { user: socket.decoded_token });
                    socket.room = '';
                });
            }

            function inviteUserHandler ({ roomId, userId }) {
                Room
                    .findById(roomId)
                    .then(room => {
                        if (room.creator.toString() !== socket.decoded_token.id)
                            return;
                        if (userId in room.users)
                            return;
                        room.users.push(userId);
                        room
                            .save()
                            .then(savedRoom => {
                                socket.emit(SOCKETS.INVITE_USER, { roomId: savedRoom.id, userId });
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }


            function deleteMessageHandler ({ msgId }) {
                const user = socket.decoded_token;

                Message
                    .findById(msgId)
                    .then(msg => {
                        if (msg.author.toString() !== user.id
                            || 'role' in user && user.role !== 'admin')
                            throw new Error(SOCKETS.ERROR_NO_PERMISSION);
                        return msg.id;
                    })
                    .then(deleteMessage)
                    .then(sendDeletedMessageId)
                    .catch(sendError);
            }

            function deleteMessage (id) {
                return Message
                    .remove({ _id: id })
                    .then(() => id)
                    .catch(err => {
                        console.error(err);
                        throw new Error('database error');
                    });
            }

            function sendDeletedMessageId (id) {
                return new Promise((resolve, reject) => {
                    try {
                        if (socket.room)
                            io.to(socket.room).emit(SOCKETS.DELETE_MESSAGE, { id });
                        else
                            io.emit(SOCKETS.DELETE_MESSAGE, { id });
                        resolve(id);
                    } catch (err) {
                        console.error(err);
                        reject('socket io error');
                    }
                });
            }

            function editMessageHandler ({ msgId, msgText }) {
                const user = socket.decoded_token;

                Message
                    .findById(msgId)
                    .then(msg => {
                        // console.log(msg.author.toString() === user.id);
                        if (msg.author.toString() !== user.id
                            && 'role' in user && user.role !== 'admin')
                            throw new Error(SOCKETS.ERROR_NO_PERMISSION);

                        msg.text = msgText;
                        // msg['editedAt'] = new Date();
                        return msg
                            .save()
                            .then(savedMessage => {
                                let localIO = io;

                                if (socket.room)
                                    localIO = localIO.to(socket.room);
                                localIO.emit(SOCKETS.EDIT_MESSAGE,
                                    { id: savedMessage.id, text: savedMessage.text });
                            });
                    })
                    .catch(err => sendError(err));
            }

            function listMessagesHandler (filter) {
                const cutoff = filter && filter.cutoff || new Date(),
                    limitCount = filter && filter.limitCount || SOCKETS.DEFAULT_LIMIT_MESSAGE_NUMBER,
                    findFilter = { sentAt: { $lt: cutoff } };

                if (socket.room)
                    findFilter.room = socket.room;
                Message
                    .find(findFilter)
                    .limit(limitCount)
                    .sort({ sentAt: -1 })
                    .populate('author', 'username')
                    .select({ 'id': 1, 'text': 1, 'author': 1, 'sentAt': 1, 'editedAt': 1 })
                    .then(msgs => {
                        const items = msgs.map(msg => ({
                            id: msg.id,
                            msg: msg.text,
                            time: +msg.sentAt,
                            user: {
                                id: msg.author.id,
                                username: msg.author.username
                            }
                        }));

                        socket.emit(SOCKETS.MESSAGES, items);
                    });
            }

            function chatMessageHandler (msg) {
                const user = socket.decoded_token,
                    msgObj = {
                        text: msg,
                        author: user.id,
                        sentAt: +new Date
                    },
                    message = new Message(msgObj);

                if (socket.room)
                    message.room = socket.room;
                message.save((err, savedMessage) => {
                    if (err)
                        sendError(err);
                    else
                        findAuthor(savedMessage)
                            .then(formatMessage)
                            .then(broadcastMessage)
                            .catch(sendError);
                });
            }

            function broadcastMessage (message) {
                if (socket.room)
                    return io.to(socket.room).emit(SOCKETS.MESSAGE, message);
                return io.emit(SOCKETS.MESSAGE, message);
            }

            function disconnectHandler () {
                io.emit('leave', {
                    user: socket.decoded_token,
                    time: Date.now()
                });
            }

            function sendError (error) {
                if (error instanceof Error)
                    error = error.message;
                return socket.emit(SOCKETS.ERROR_MESSAGE, { error });
            }
        });

    function findAuthor (message) {
        return Promise.all([
            Promise.resolve(message),
            User.findById(message.author)
        ]);
    }

    function formatMessage ([message, user]) {
        return Promise.resolve({
            id: message.id,
            msg: message.text,
            time: +message.sentAt,
            user: {
                id: user.id,
                username: user.username
            }
        });
    }
};


module.exports = initSocketIO;
