const chai = require('chai');
const mocha = require('mocha');
const should = chai.should();

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
//const socketioJwt = require('socketio-jwt');

const config = require('../server/config.js');

describe('echo', () => {
  let server;
  const options = {
    transport: ['websocket'],
    'force new connection': true
  };

  beforeEach(done => {
    server = require('../server/server');
    done();
  })

  // demo
  xit('echo msg', (done) => {
    const client = io.connect(`http://${config.host}:${config.port}`, options);
    // console.log(client);
    client.once("connect", () => {
      client.once("echo", (msg) => {
        msg.should.equal("Hello World");
        client.disconnect();
        done();
      });

      // console.log('before echo');
      client.emit("echo", "Hello World");
    });
  });

  it('shoutd authenticate user', (done) => {
    const client = io.connect(`http://${config.host}:${config.port}`, options);
    const fakeUser = { username: "foo" };
    const token = jwt.sign(fakeUser, config.jwt_secret, { noTimestamp: true });
    // console.log(token);
    client.once("connect", () => {
      client
        .once('authenticated', () => {
          console.log('auth ok');
        })
        .once('unauthorized', (res) => {
          console.log('auth not ok');
          client.disconnect();
          done();
        })
        .once('join', (res) => {
          res['user']['username'].should.equal('foo');
          client.disconnect();
          done();
        });

      // console.log('before auth');
      client.emit('authenticate', { token })
    });
  });
});
