process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const mongoose = require('mongoose');

const app = require('../server/app');
const User = require('../server/models/user');

describe('User model', () => {
  beforeEach(done => {
    // console.log(User.collection);
    User.collection.drop(
      (err, res) => {
        if (err) {
          console.error(err);
        }
        done();
      });
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
    })
  });
});
