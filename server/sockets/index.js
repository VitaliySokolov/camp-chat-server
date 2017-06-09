// const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt'),
    config = require('../config.js'),
    SOCKETS = require('../../shared/socket.io/events'),
    ChatSocket = require('./chat-socket');

require('./helpers');
require('./users');
require('./rooms');
require('./messages');

function initSocketIO (io) {
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
            const chatSocket = new ChatSocket(socket);

            socket
                .on(SOCKETS.MESSAGE,
                    chatSocket.chatMessageHandler.bind(chatSocket))
                .on(SOCKETS.EDIT_MESSAGE,
                    chatSocket.editMessageHandler.bind(chatSocket))
                .on(SOCKETS.DELETE_MESSAGE,
                    chatSocket.deleteMessageHandler.bind(chatSocket))
                .on(SOCKETS.USERS,
                    chatSocket.listUsersHandler.bind(chatSocket))
                .on(SOCKETS.USER,
                    chatSocket.chatUsersHandler.bind(chatSocket))
                .on(SOCKETS.EDIT_USER,
                    chatSocket.editUsersHandler.bind(chatSocket))
                .on(SOCKETS.MESSAGES,
                    chatSocket.listMessagesHandler.bind(chatSocket))
                .on(SOCKETS.ROOMS,
                    chatSocket.listRoomsHandler.bind(chatSocket))
                .on(SOCKETS.ROOM_USERS,
                    chatSocket.listRoomUsersHandler.bind(chatSocket))
                .on(SOCKETS.ADD_ROOM,
                    chatSocket.addRoomHandler.bind(chatSocket))
                .on(SOCKETS.DELETE_ROOM,
                    chatSocket.deleteRoomHandler.bind(chatSocket))
                .on(SOCKETS.EDIT_ROOM,
                    chatSocket.editRoomHandler.bind(chatSocket))
                .on(SOCKETS.JOIN_ROOM,
                    chatSocket.joinRoomHandler.bind(chatSocket))
                .on(SOCKETS.LEAVE_ROOM,
                    chatSocket.leaveRoomHandler.bind(chatSocket))
                .on(SOCKETS.INVITE_USER,
                    chatSocket.inviteUserHandler.bind(chatSocket))
                .on(SOCKETS.KICK_USER,
                    chatSocket.kickUserHandler.bind(chatSocket))
                .on(SOCKETS.DISCONNECT, disconnectHandler);

            function disconnectHandler () {
                io.emit('leave', {
                    user: socket.decoded_token,
                    time: Date.now()
                });
            }
        });
}

module.exports = initSocketIO;
