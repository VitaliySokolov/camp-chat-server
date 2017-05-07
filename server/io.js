const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');

const config = require('./config.js');

const User = require('./models/user');
const Message = require('./models/message');

const initSocketIO = (io) => {
  io.sockets
    .on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        callback: false
      }))
    .on('authenticated', socket => {
      io.emit('join', {
        user: socket.decoded_token,
        time: Date.now()
      })

      socket
        .on('unauthorized', unauthorizedHandler)
        .on('message', chatMessageHandler)
        .on('disconnect', disconnectHandler)

      function unauthorizedHandler(error) {
        if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
          // redirect user to login page perhaps?
          console.log("User's token has expired");
        }
      }

      function chatMessageHandler(msg) {
        const user = socket.decoded_token;
        const msgObj = {
          text: msg,
          author: user.id,
          room: 0,
          sentAt: +(new Date),
        };
        const message = new Message(msgObj);
        message.save((err, message) => {
          if (err) {
            io.emit('error', err);
          } else {
            User.findById(message.author, (err, user) => {
              if (err) {
                return console.error(err);
              }
              const msg = {
                id: message.id,
                msg: message.text,
                time: +message.sentAt,
                user: {
                  id: user.id,
                  username: user.username
                }
              };
              io.emit('message', msg);
            });
          }
        });
      }

      function disconnectHandler() {
        io.emit('leave', {
          user: socket.decoded_token,
          time: Date.now()
        });
      }
    });
}

module.exports = initSocketIO
