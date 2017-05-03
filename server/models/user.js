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

  async.waterfall([
    callback => {
      User.findOne({ username }, callback);
    },
    (user, callback) => {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user)
        } else {
          callback('Error password checking', null)
        }
      } else {
        const user = new User({ username, password });

        user.save(err => {
          if (err) {
            if (err.code === 11000) {
              return res.send({
                error: `User with username "${username}" already exist`
              });
            }
            return res.send({ error: err.message });
          }
          callback(null, user)
        })
      }
    }
  ], callback);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
