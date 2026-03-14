const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['response', 'expectations'],
    required: true
  },
  choice: {
    type: String,
    enum: ['yes', 'convince', null],
    default: null
  },
  expectations: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', ResponseSchema);