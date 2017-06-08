const
    SOCKETS = require('../../shared/socket.io/events'),
    ChatSocket = require('./chat-socket');

ChatSocket.prototype.getSocketId = function (userId) {
    const foundSocket = Object
        .keys(this.io.sockets.sockets)
        .map(id => this.io.sockets.sockets[id])
        .find(s => s.decoded_token
            && s.decoded_token.id === userId);

    if (foundSocket)
        return foundSocket.id;
    return foundSocket;
};

ChatSocket.prototype.sendError = function (error) {
    if (error instanceof Error)
        error = error.message;
    return this.socket.emit(SOCKETS.ERROR_MESSAGE, { error });
};

module.exports = {};
