const mongoose = require('mongoose');

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
        default: new Date
    },
    editedAt: {
        type: Date,
        default: new Date
    },
    participants: [{
        type: ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Room', roomSchema);
