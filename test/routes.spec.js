process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const except = chai.expect;
// const config = require('../server/config');
const mongoose = require('mongoose');

const app = require('../server/app');
const User = require('../server/models/user');
// console.log(app);
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

xdescribe('Testing routes', () => {
  // User.collection.drop(err => {
  //   console.error(err);
  // });

  beforeEach(done => {
    // console.log(mongoose.connection);
    mongoose.connection.db
      .dropCollection('users', (err, res) => {
        // console.log(mongoose.connection);
        // console.log(err);
        User.find({}, (e, v) => console.log(v));
        // console.error(User.find());
        if (err) {
          console.error(err);
          done();
          return;
        }
        const user = new User({
          username: 'foo',
          password: 'bar'
        });
        user.save(err => {
          if (err) {
            console.error(err);
          }
          User.find({}, (e, v) => console.log(v))
          done();
        });
      })
    User.collection.drop()
      .then(() => {
      })
      .catch(err => {
        done(err)
      })
    // mongoose.connection.db.dropCollection('user', cb)
    done();
  });

  afterEach(done => {
    // User.collection.drop().then(() => {
    //   done();
    // }).catch(err => {
    //   done(err);
    // });
    done();
  })

  describe('GET /users', () => {
    it('should response with user list', (done) => {
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
    xit('should response with a fail message', (done) => {
      chai.request(app)
        .post('/login')
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(401);
          done();
        });
      // done();
    });

    xit('should response with a fail message', (done) => {
      chai.request(app)
        .post('/login')
        .send({
          username: 'foo'
        })
        .end((err, res) => {
          should.exist(err);
          res.status.should.equal(401);
          res.body.should.have.property('error', 'Please specify login and pass!')
          done();
        });
    });

    xit('should response with a success message', (done) => {
      console.error('berore last response');
      chai.request(app)
        .post('/login')
        .send({ username: 'foo', pass: 'bar' })
        .end((err, res) => {
          should.not.exist(err);
          res.type.should.equal('application/json');
          res.body.should.deep.equal({
            'username': 'foo'
          });
          done();
        })
    });
  });

  describe('POST /logout', () => {
    xit('should response with a success message', (done) => {
      chai.request(app)
        .post('/logout')
        .end((err, res) => {
          should.not.exist(err);
          res.type.should.equal('application/json');
          res.body.should.deep.equal({ ok: 'ok' });
          done();
        });
    });
  });
});
