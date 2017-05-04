require('dotenv').config();
const config = require('./config.js');

const app = require('./app');
const http = require('http').Server(app);

const io = require('socket.io')(http);
const initSocketIO = require('./io')
initSocketIO(io);

const server = http.listen(config.port, config.host, () => {
  console.log(`Auth servise running on http://${server.address().address}:${server.address().port}`)
})

module.exports = server;
