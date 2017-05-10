const app = require('./app');
const config = require('./config.js');
app.set('port', config.port);
const http = require('http').Server(app);

const io = require('socket.io')(http);
const initSocketIO = require('./sockets')
initSocketIO(io);

const serverPromise = new Promise((resolve, reject) => {
  const server = http.listen(
    app.get('port'), () => {
      console.log(
        `Chat service running on ${server.address().port}`
      );
      resolve(server);
    });
});

module.exports = serverPromise;
