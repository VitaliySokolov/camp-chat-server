process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = require('../server/app');
const User = require('../server/models/user');

describe('User model', () => {
  beforeEach(done => {
    User.remove(() => done());
  });

  afterEach(done => {
    done();
  })

  it('should not validate new User', () => {
    const user = new User({
      name: 'foo',
      pass: 'bar',
    });
    const error = user.validateSync();
    const fn = () => { throw error }
    expect(fn).to.throw(mongoose.Error, /Path `username` is required/);
  });

  it('create new User', () => {
    const user = new User({
      username: 'foo',
      password: 'bar',
    });
    user.save((err, res) => {
      should.not.exist(err);
      expect(res.username).to.equal('foo');
    })
  });

  it('check password', () => {
    const user = new User({
      username: 'foo',
      password: 'baz'
    });
    user.save((err, res) => {
      should.not.exist(err);
      expect(res.username).to.equal('foo');
      expect(res.checkPassword('baz')).to.be.true;
      expect(res.checkPassword('bar')).not.to.be.true;
    });
  });

  it('should authorize user', () => {
    const user = new User({
      username: 'foo',
      password: 'bar',
    });
    user.save((err, user) => {
      should.not.exist(err);
      expect(user.username).to.equal('foo');

      User.authorize('foo', 'bar', (err, res) => {
        should.not.exist(err);
        expect(res.username).to.equal('foo');
      });
    });
  });
});
