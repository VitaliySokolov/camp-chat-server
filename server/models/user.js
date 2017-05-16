const mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    Room = require('./room'),
    Message = require('./message');

const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        default: 'user'
    }
});

userSchema.pre('remove', function (next) {
    Promise.all([
        Room.remove({ creator: this._id }),
        Message.remove({ author: this._id })
    ]).then(() => next());
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true
});
// userSchema.pre('save', function(next) {
//   now = new Date();
//   // console.log(this);
//   if (!this.createdAt) {
//     this.createdAt = now;
//   }
//   next();
// });

// userSchema.pre('update', function(next) {
//   now = new Date();
//   console.log('update');
//   console.log(now);
//   if (!this.editedAt) {
//     this.editedAt = now;
//   }
//   next();
// });

// userSchema.pre('findByIdAndUpdate', function(next) {
//   now = new Date();
//   console.log('updatebyid');
//   console.log(now);
//   if (!this.editedAt) {
//     this.editedAt = now;
//   }
//   next();
// });

userSchema.methods.encryptPassword = function (password) {
    return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
};

/**
 * @this Schema
 */
const setVirtualPassword = function (password) {
    this._plainPassword = password;
    this.salt = `${Math.random()}`;
    this.hashedPassword = this.encryptPassword(password);
};

/**
 * @this Schema
 */
const getVirtualPassword = function () {
    return this._plainPassword;
};

userSchema.virtual('password')
    .set(setVirtualPassword)
    .get(getVirtualPassword);

userSchema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

userSchema.statics.authorize = function (
    username, password, callback) {
    const User = this;
    const handleExistedUser = (user, cb) => {
        if (user.checkPassword(password))
            cb(null, user);
        else
            cb('Username or password are incorrect', null);
    };

    async.waterfall([
        callback => {
            User.findOne({ username }, callback);
        },
        (user, callback) => {
            if (user)
                handleExistedUser(user, callback);
            else
                callback('User is not register', null);
        }
    ], callback);
};

module.exports = mongoose.model('User', userSchema);
