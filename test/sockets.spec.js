process.env.NODE_ENV = 'test';

const chai = require('chai');
const mocha = require('mocha');
const should = chai.should();

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const serverPromise = require('../server/server');

const config = require('../server/config');
const serverURL = `http://localhost:${config.port}`;

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const User = require('../server/models/user');
const Message = require('../server/models/message');

describe('SocketIO connection', () => {
  let client;
  const fooUser = {
    id: 'fooId',
    username: "foo"
  };
  const token = jwt.sign(
    fooUser,
    config.jwt_secret,
    { noTimestamp: true }
  );
  const options = {
    transport: ['websocket'],
    'force new connection': true
  };

  before(done => {
    serverPromise.then(server => {
      done();
    });
  });

  beforeEach(done => {
    client = io.connect(
      serverURL,
      options);
    client.on("connect", () => {
      client.emit('authenticate', { token });
      done();
    });
  });

  afterEach(done => {
    if (client.connected) {
      client.disconnect();
    }
    done();
  })

  it('should not authenticate user with wrong token', (done) => {
    client.disconnect();
    client = io.connect(serverURL, options);
    client.on("connect", () => {
      client.once('unauthorized', () => {
        done();
      })
      client.emit('authenticate', { token: "wrong token" });
    });
  });

  it('should authenticate user', (done) => {
    client
      .once('authenticated', () => {
        // console.log('auth ok');
        done();
      });
  });

  it('should join chat', (done) => {
    client.once('join', (data) => {
      data['user']['username'].should.equal(fooUser.username);
      done();
    });
  });

  it('should leave chat', (done) => {
    const barUser = { username: "bar" };
    const barToken = jwt.sign(
      barUser,
      config.jwt_secret,
      { noTimestamp: true }
    );

    client.once('leave', (data) => {
      data['user']['username'].should.equal(barUser.username);
      done();
    });

    newClient = io.connect(serverURL, options);
    newClient.on("connect", () => {
      newClient.once('join', () => {
        newClient.disconnect();
      })
      newClient.emit('authenticate', { token: barToken });
    });
  });

  describe('`messages`', () => {

    afterEach((done) => {
      Promise
        .all([
          Message.remove(),
          User.remove()
        ])
        .then(() => done())
    });

    it('should send message', (done) => {
      expectedMessage = 'hello world';
      const User = require('../server/models/user');
      const user = new User({
        username: 'bar',
        password: 'baz'
      });
      user.save((err, user) => {
        if (err) {
          return console.error(err);
        }
        const barUser = {
          id: user.id,
          username: user.username
        };

        const barToken = jwt.sign(
          barUser,
          config.jwt_secret,
          { noTimestamp: true }
        );

        client.disconnect()
        client = io.connect(serverURL, options);
        client.on("connect", () => {

          client.on('message', (data) => {
            data.msg.should.equal(expectedMessage);
            done();
          });

          client.once('join', () => {
            client.emit('message', expectedMessage);
          })

          client.emit('authenticate', { token: barToken });
        });
      });

    });

    it('should receive empty array of messages', done => {
      client.on('messages', data => {
        data.should.deep.equal([])
        done();
      });
      Promise
        .all([
          Message.remove(),
        ])
        .then(() => client.emit('get messages'));
    });

    it('should receive one message', done => {
      expectedAuthor = 'bar';
      expectedMessage = 'hello foo';
      client.on('messages', data => {
        data[0].msg.should.equal(expectedMessage)
        data[0].user.username.should.equal(expectedAuthor)
        done();
      });

      const saveMessage = (user, msgText) => {
        new Message({
          text: msgText,
          author: user.id
        })
          .save()
          .then(msg => {
            client.emit('get messages')
          })
          .catch(err => console.error(err));
      }

      new User({
        username: expectedAuthor,
        password: 'baz'
      })
        .save()
        .then(user => saveMessage(user, expectedMessage))
        .catch(err => console.error(err));
    });

    it('should not receive newer than cutoff', done => {
      expectedAuthor = 'bar';
      expectedMessage = 'hello foo';
      client.on('messages', data => {
        data.should.deep.equal([])
        done();
      });

      const saveMessage = (user, msgText) => {
        let d = new Date();
        new Message({
          text: msgText,
          author: user.id,
          sentAt: d.setDate(d.getDate() - 2)
        })
          .save()
          .then(msg => {
            client.emit('get messages',
              { cutoff: d.setDate(d.getDate() - 2) })
          })
          .catch(err => console.error(err));
      }

      new User({
        username: expectedAuthor,
        password: 'baz'
      })
        .save()
        .then(user => saveMessage(user, expectedMessage))
        .catch(err => console.error(err));
    });

    it('should receive too old messages when request them', done => {
      expectedAuthor = 'bar';
      expectedMessage = 'hello foo';
      client.on('messages', data => {
        data[0].msg.should.equal(expectedMessage)
        data[0].user.username.should.equal(expectedAuthor)
        done();
      });

      const saveMessage = (user, msgText) => {
        let d = new Date();
        new Message({
          text: msgText,
          author: user.id,
          sentAt: d.setDate(d.getDate() - 2)
        })
          .save()
          .then(msg => {
            client.emit('get messages',
              { cutoff: d.setDate(d.getDate() + 2) })
          })
          .catch(err => console.error(err));
      }

      new User({
        username: expectedAuthor,
        password: 'baz'
      })
        .save()
        .then(user => saveMessage(user, expectedMessage))
        .catch(err => console.error(err));
    });

    it('should edit message', done => {
      expectedAuthor = 'bar';
      initialMessage = 'hi foo';
      expectedMessage = 'hello foo';

      const saveMessage = (user, msgText, client) => {
        new Message({
          text: msgText,
          author: user,
        })
          .save()
          .then(msg => {
            client.emit('put message',
              { id: msg.id, msg: expectedMessage })
          })
          .catch(err => console.error(err));
      }

      new User({
        username: expectedAuthor,
        password: 'baz'
      })
        .save()
        .then(user => {
          const barUser = {
            id: user.id,
            username: user.username
          };

          const barToken = jwt.sign(
            barUser,
            config.jwt_secret,
            { noTimestamp: true }
          );

          client.disconnect()
          client = io.connect(serverURL, options);
          client.on("connect", () => {

            client.on('message', data => {
              data.msg.should.equal(expectedMessage)
              // data.user.username.should.equal(expectedAuthor)
              done();
            });

            client.once('join', () => {
              saveMessage(user, initialMessage, client);
            })

            client.emit('authenticate', { token: barToken });
          })
        })
        .catch(err => console.error(err));
    });

  });
});
