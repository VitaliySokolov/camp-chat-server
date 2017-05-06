process.env.NODE_ENV = 'test';

const chai = require('chai');
const mocha = require('mocha');
const should = chai.should();

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
//const socketioJwt = require('socketio-jwt');
const serverPromise = require('../server/server');

const config = require('../server/config');
const serverURL = `http://localhost:${config.port}`;

describe('SocketIO connection', () => {
  let client;
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
      done();
    });
  });

  afterEach(done => {
    if (client.connected) {
      client.disconnect();
    }
    done();
  })

  // demo
  xit('echo msg', (done) => {
    const client = io.connect(ServerURL, options);
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
    const fakeUser = { username: "foo" };
    const token = jwt.sign(
      fakeUser,
      config.jwt_secret,
      { noTimestamp: true }
    );
    // console.log(token);
    client
      .once('authenticated', () => {
        console.log('auth ok');
      })
      .once('unauthorized', (res) => {
        console.log('auth not ok');
        // client.disconnect();
        done();
      })
      .once('join', (res) => {
        res['user']['username'].should.equal('foo');
        // client.disconnect();
        done();
      });

    client.emit('authenticate', { token });
  });
});
