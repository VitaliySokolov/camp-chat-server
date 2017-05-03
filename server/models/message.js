var mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
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
    ref: 'Room',
    defaul: 0
  },
  sentAt: {
    type: Date,
    default: new Date
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
