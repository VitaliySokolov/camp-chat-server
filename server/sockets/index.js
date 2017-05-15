// const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt'),
    config = require('../config.js'),
    User = require('../models/user'),
    Message = require('../models/message'),
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
                // .on('unauthorized', unauthorizedHandler)
                .on('message', chatMessageHandler)
                .on('disconnect', disconnectHandler)
                .on('get messages', chatGetMessagesHandler)
                .on('put message', chatPutMessageHandler)
                .on('delete message', chatDeleteMessageHandler);

            // function unauthorizedHandler(error) {
            //   if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
            //     // redirect user to login page perhaps?
            //     console.log("User's token has expired");
            //   }
            // }

            function chatDeleteMessageHandler ({ msgId }) {
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
                        io.emit('message_deleted', { id });
                        resolve(id);
                    } catch (err) {
                        console.error(err);
                        reject('socket io error');
                    }
                });
            }

            function chatPutMessageHandler ({ msgId, msgText }) {
                const user = socket.decoded_token;

                Message
                    .findById(msgId)
                    .then(msg => {
                        // console.log(msg.author.toString() === user.id);
                        if (msg.author.toString() !== user.id
                            && 'role' in user && user.role !== 'admin') {
                            socket.emit('error', 'no permission to edit msg');
                            return;
                        }
                        msg.text = msgText;
                        // msg['editedAt'] = new Date();
                        msg
                            .save()
                            .then(msg => {
                                // console.log('new:', msg);
                                io.emit('message_changed', {
                                    id: msg.id,
                                    text: msg.text
                                });
                            })
                            .catch(err => socket.emit('error', err));
                    })
                    .catch(err => socket.emit('error', err));
            }

            function chatGetMessagesHandler (filter) {
                const cutoff = filter && filter.cutoff || new Date(),
                    limitCount = filter && filter.limitCount || SOCKETS.DEFAULT_LIMIT_MESSAGE_NUMBER;
                // cutoff.setDate(cutoff.getDate() - filter.days);

                Message
                    .find({ sentAt: { $lt: cutoff } })
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

                        socket.emit('messages', items);
                    });
            }

            function chatMessageHandler (msg) {
                const user = socket.decoded_token,
                    msgObj = {
                        text: msg,
                        author: user.id,
                        room: 0,
                        sentAt: +new Date
                    },
                    message = new Message(msgObj);

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

            function disconnectHandler () {
                io.emit('leave', {
                    user: socket.decoded_token,
                    time: Date.now()
                });
            }

            function sendError (error) {
                if (error instanceof Error)
                    error = error.message;
                return socket.emit('error message', { error });
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

    function broadcastMessage (message) {
        return io.emit('message', message);
    }
};


module.exports = initSocketIO;
