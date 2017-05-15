process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const mongoose = require('mongoose');

// const app = require('../server/app');
const User = require('../server/models/user');

mongoose.Promise = global.Promise;

describe('User model', () => {
    beforeEach(done => {
        User.remove(() => done());
    });

    it('should not validate new User', () => {
        const user = new User({
            name: 'foo',
            pass: 'bar'
        });
        const error = user.validateSync(),
            fn = () => {
                throw error;
            };

        expect(fn).to.throw(mongoose.Error, /Path `username` is required/);
    });

    it('create new User', done => {
        const user = new User({
            username: 'foo',
            password: 'bar'
        });

        user.save((err, res) => {
            should.not.exist(err);
            // console.log(res);
            expect(res.username).to.equal('foo');
            done();
            // setTimeout(function () {
            //   User.update({_id: res.id},
            //     { $set: { username: 'bar' } },
            //     { new: true, runValidators: true }, (err, u) => {
            //       console.log(err);
            //       console.log(u);
            //       done();
            //     })
            // }, 100);
        });
    });

    it('check password', done => {
        const user = new User({
            username: 'foo',
            password: 'baz'
        });

        user.password.should.be.a('string');
        user.password.should.equal('baz');

        user.save((err, savedUser) => {
            should.not.exist(err);
            savedUser.username.should.equal('foo');
            savedUser.checkPassword('baz').should.equal(true);
            savedUser.checkPassword('bar').should.equal(false);
            return done();
        });
    });

    it('should authorize user', done => {
        const user = new User({
            username: 'foo',
            password: 'bar'
        });

        user.save((err, savedUser) => {
            should.not.exist(err);
            expect(savedUser.username).to.equal('foo');

            User.authorize('foo', 'bar', (err, res) => {
                should.not.exist(err);
                expect(res.username).to.equal('foo');
                done();
            });
        });
    });
});
