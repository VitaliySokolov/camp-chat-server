var mongoose = require('mongoose');
const crypto = require('crypto');
const async = require('async');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
  },
  avatar: {
    type: String,
  }
});

userSchema.methods.encryptPassword = function (password) {
  return crypto
    .createHmac('sha1', this.salt)
    .update(password)
    .digest('hex');
}

userSchema.virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(() => this._plainPassword);

userSchema.methods.checkPassword = function (password) {
  return this.encryptPassword(password) == this.hashedPassword;
}

userSchema.statics.authorize = function (
  username, password, callback) {
  const User = this;
  const handleExistedUser = (user, cb) => {
    if (user.checkPassword(password)) {
      cb(null, user)
    } else {
      cb('Username or password are incorrect', null)
    }
  }

  async.waterfall([
    callback => {
      User.findOne({ username }, callback);
    },
    (user, callback) => {
      if (user) {
        handleExistedUser(user, callback);
      } else {
        callback('User is not register', null)
      }
    }
  ], callback);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
