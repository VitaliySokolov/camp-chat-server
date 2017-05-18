const mongoose = require('mongoose'),
    Message = require('./message');

const Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId;

const roomSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: ObjectId,
        ref: 'User',
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
    users: [{
        type: ObjectId,
        ref: 'User'
    }]
});

roomSchema.pre('save', function (next) {
    if (!this.users.find(user => this.creator.equals(user)))
        this.users = [...this.users, this.creator];
    if (!this.createdAt)
        this.createdAt = Date.now();
    if (!this.editedAt)
        this.editedAt = Date.now();
    next();
});

roomSchema.pre('remove', function (next) {
    Message.remove({ roomId: this._id }, next);
});

roomSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

roomSchema.set('toJSON', {
    virtuals: true
});


module.exports = mongoose.model('Room', roomSchema);
