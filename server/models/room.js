var mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: new Date
  },
  participants: [{
    type: ObjectId,
    ref: 'User'
  }]
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
