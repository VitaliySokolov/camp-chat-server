const
    ChatSocket = require('./chat-socket'),
    User = require('../models/user'),
    Message = require('../models/message'),
    SOCKETS = require('../../shared/socket.io/events'),
    CONSTANTS = require('./constants');

ChatSocket.prototype.deleteMessageHandler = function ({ msgId }) {
    const user = this.socket.decoded_token;

    Message
        .findById(msgId)
        .then(msg => {
            if (msg.author.toString() !== user.id
                || 'role' in user && user.role !== 'admin')
                throw new Error(CONSTANTS.ERROR_NO_PERMISSION);
            return msg.id;
        })
        .then(this.deleteMessage)
        .then(this.sendDeletedMessageId.bind(this))
        .catch(this.sendError.bind(this));
};

ChatSocket.prototype.deleteMessage = function (id) {
    return Message
        .remove({ _id: id })
        .then(() => id)
        .catch(err => {
            console.error(err);
            throw new Error('database error');
        });
};

ChatSocket.prototype.sendDeletedMessageId = function (id) {
    return new Promise((resolve, reject) => {
        try {
            if (this.socket.room)
                this.io.to(this.socket.room).emit(SOCKETS.DELETE_MESSAGE, { id });
            else
                this.io.emit(SOCKETS.DELETE_MESSAGE, { id });
            resolve(id);
        } catch (err) {
            console.error(err);
            reject('socket io error');
        }
    });
};

ChatSocket.prototype.editMessageHandler = function ({ msgId, msgText }) {
    const user = this.socket.decoded_token;

    Message
        .findById(msgId)
        .then(msg => {
            // console.log(msg.author.toString() === user.id);
            if (msg.author.toString() !== user.id
                && 'role' in user && user.role !== 'admin')
                throw new Error(CONSTANTS.ERROR_NO_PERMISSION);

            msg.text = msgText;
            // msg['editedAt'] = new Date();
            return msg
                .save()
                .then(savedMessage => {
                    let localIO = this.io;

                    if (this.socket.room)
                        localIO = localIO.to(this.socket.room);
                    localIO.emit(SOCKETS.EDIT_MESSAGE,
                        { id: savedMessage.id, text: savedMessage.text });
                });
        })
        .catch(err => this.sendError(err));
};

ChatSocket.prototype.listMessagesHandler = function (filter) {
    const cutoff = filter && filter.cutoff || new Date(),
        limitCount = filter && filter.limitCount || CONSTANTS.DEFAULT_LIMIT_MESSAGE_NUMBER,
        findFilter = { sentAt: { $lt: cutoff } };

    if (this.socket.room)
        findFilter.room = this.socket.room;
    else
        findFilter.room = { $exists: false };
    Message
        .find(findFilter)
        .limit(limitCount)
        .sort({ sentAt: -1 })
        .populate('author', 'username')
        .select({ 'id': 1, 'text': 1, 'author': 1, 'sentAt': 1, 'editedAt': 1, 'room': 1 })
        .then(msgs => {
            const
                items = msgs.map(msg => {
                    const newMsg = {
                        id: msg.id,
                        msg: msg.text,
                        time: +msg.sentAt,
                        user: {
                            id: msg.author.id,
                            username: msg.author.username
                        }
                    };

                    if (msg.room)
                        newMsg.room = msg.room;
                    return newMsg;
                }),
                roomId = this.socket.room || CONSTANTS.COMMON_ROOM_ID;

            this.socket.emit(SOCKETS.MESSAGES, { roomId, messages: [...items] });
        });
};

ChatSocket.prototype.chatMessageHandler = function (msg) {
    const user = this.socket.decoded_token,
        msgObj = {
            text: msg,
            author: user.id,
            sentAt: Date.now()
        },
        message = new Message(msgObj);

    if (this.socket.room)
        message.room = this.socket.room;
    message.save((err, savedMessage) => {
        if (err)
            this.sendError(err);
        else
            this.findAuthor(savedMessage)
                .then(this.formatMessage)
                .then(this.broadcastMessage.bind(this))
                .catch(this.sendError);
    });
};

ChatSocket.prototype.broadcastMessage = function (message) {
    if (this.socket.room)
        return this.io.to(this.socket.room).emit(SOCKETS.MESSAGE, message);
    return this.io.emit(SOCKETS.MESSAGE, message);
};

ChatSocket.prototype.findAuthor = function (message) {
    return Promise.all([
        Promise.resolve(message),
        User.findById(message.author)
    ]);
};

ChatSocket.prototype.formatMessage = function ([message, user]) {
    const newMsg = {
        id: message.id,
        msg: message.text,
        time: +message.sentAt,
        user: {
            id: user.id,
            username: user.username
        }
    };

    if (message.room)
        newMsg.room = message.room;
    return Promise.resolve(newMsg);
};


module.exports = {};
