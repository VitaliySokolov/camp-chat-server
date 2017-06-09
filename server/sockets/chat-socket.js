function ChatSocket (socket) {
    this.io = socket.server;
    this.socket = socket;
}

module.exports = ChatSocket;
