const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId;

const messageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: ObjectId,
        ref: 'Room'
    },
    sentAt: {
        type: Date,
        default: new Date
    },
    editedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Message', messageSchema);
