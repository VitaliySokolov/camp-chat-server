var mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

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
  sentAt: {
    type: Date,
    default: new Date
  },
  editedAt: {
    type: Date,
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
