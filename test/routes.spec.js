process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const except = chai.expect;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const app = require('../server/app');
const User = require('../server/models/user');
const Message = require('../server/models/message');

chai.use(chaiHttp);

describe('Testing root route', () => {
  describe('GET /', () => {
    it('should response with readme.md', (done) => {
      chai.request(app)
        .get('/').end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('text/html');
          done();
        });
    });
  });
});

describe('Testing routes', () => {

  beforeEach(done => {
    const createDefUser = () => {
      const user = new User({
        username: 'foo',
        password: 'bar'
      });
      user.save(err => {
        if (err) {
          console.error(err);
        }
        done();
      });
    };

    User.remove((err) => {
      if (err) {
        console.error(err);
      }
      createDefUser();
    });
  });

  describe('GET /users', () => {
    it('should response with user list', (done) => {
      // console.log(app);
      chai.request(app)
        .get('/users').end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('application/json');
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('username', 'foo');
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should response with a fail message', (done) => {
      chai.request(app)
        .post('/login')
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(400);
          done();
        });
    });

    it('should response with a fail message: missing password', (done) => {
      chai.request(app)
        .post('/login')
        .send({
          username: 'foo'
        })
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(400);
          res.body.should.have.property('error',
            'Please specify login and pass!')
          done();
        });
    });

    it('should response with a fail message when invalid username', (done) => {
      chai.request(app)
        .post('/login')
        .send({
          username: 'fo o',
          password: 'baz'
        })
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(400);
          res.body.should.have.property('error',
            'Please specify login and pass!')
          done();
        });
    });

    it('should response with `wrong username/password`', (done) => {
      chai.request(app)
        .post('/login')
        .send({
          username: 'foo',
          password: 'baz'
        })
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(401);
          res.body.should.have.property('error',
            'Username or password are incorrect');
          done()
        })
    });

    it('should response with error when user is not register', (done) => {
      chai.request(app)
        .post('/login')
        .send({
          username: 'fooo',
          password: 'baz'
        })
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(401);
          res.body.should.have.property('error',
            'User is not register');
          done()
        })
    });

    it('should response with a success message', (done) => {
      chai.request(app)
        .post('/login')
        .send({ username: 'foo', password: 'bar' })
        .end((err, res) => {
          should.not.exist(err);
          res.type.should.equal('application/json');
          res.body.should.have.property('token');
          res.body.should.have.property('tokenType', 'Bearer');
          res.body.should.have.property('user');
          res.body.user.should.have.property('username', 'foo');
          done();
        })
    });
  });

  it('should signup new User', (done) => {
    chai.request(app)
      .post('/signup')
      .send({ username: 'bar', password: 'baz' })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        done();
      });
  });

  it('should fail signup when invalid email', done => {
    chai.request(app)
    .post('/signup')
    .send({ username: 'bar', password: 'baz', email: 'foo' })
    .end((err, res) => {
      should.exist(err);
      res.status.should.equal(400);
      done();
    })
  });

  it('should success signup when valid email', done => {
    chai.request(app)
    .post('/signup')
    .send({ username: 'bar', password: 'baz', email: 'foo@example.com' })
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(201);
      done();
    })
  });

  it('should not dublicate user when signup', (done) => {
    chai.request(app)
      .post('/signup')
      .send({ username: 'foo', password: 'baz' })
      .end((err, res) => {
        should.exist(err);
        res.status.should.equal(404);
        res.body.should.have.property('error',
          'User with username "foo" already exist');
        done();
      });
  });

  describe('GET /messages', () => {
    beforeEach(done => {
      Message.remove(err => {
        if (err) {
          return console.error(err);
        }
        User.findOne({ username: 'foo' }, (err, user) => {
          if (err) {
            return console.error(err);
          }
          const msg = new Message({
            text: "hello",
            author: user.id,
          });
          msg.save((err, msg) => {
            done();
          });
        });
      });
    });

    afterEach(done => {
      Message
        .remove()
        .then(() => {
          done();
        })
        .catch(err => {
          console.error(err);
        });
    })

    it('should response with message', (done) => {
      chai.request(app)
        .get('/messages')
        .end((err, res) => {
          should.not.exist(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('msg', 'hello');
          res.body[0].should.have.property('user');
          res.body[0].user.should.have.property('id');
          res.body[0].user.should.have.property('username', 'foo');
          done();
        })
    });
  });

});
