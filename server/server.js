const app = require('./app'),
    config = require('./config.js');

app.set('port', config.port);
const http = require('http').Server(app), // eslint-disable-line new-cap
    io = require('socket.io')(http),
    initSocketIO = require('./sockets');

initSocketIO(io);

const serverPromise = new Promise(resolve => {
    const server = http.listen(
        app.get('port'), () => {
            console.info(
                `Chat service running on ${server.address().port}`
            );
            resolve(server);
        });
});

module.exports = serverPromise;
