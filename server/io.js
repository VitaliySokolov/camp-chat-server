const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');

const config = require('./config.js');

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

      function chatMessageHandler(msg, roomId = 0) {
        // const user = socket.decoded_token; // ???
        // async.parallel([
        //   cb => User.findOne(socket.decoded_token, cb),
        //   cb => Room.findOne(roomId, cb)
        // ], cb => true)
        const msgObj = {
          msg,
          user: socket.decoded_token,
          time: Date.now()
        }
        // const message = new Message(msgObj);
        // message.save((err, message) => {
        //   if (err) {
        //     io.emit('error', err);
        //   } else {
        //     io.emit('message', message);
        //   }
        // });
        mongoConnected.then(db => {
          db
            .collection('messages')
            .insert(msgObj, (err, results) => {
              if (err) {
                io.emit('error', err)
              } else {
                const msgInDb = results.ops[0];
                io.emit('message', msgInDb);
              }
            })
        })
      }

      function disconnectHandler() {
        io.emit('leave', {
          user: socket.decoded_token,
          time: Date.now()
        })
      }
    })
}

module.exports = initSocketIO
