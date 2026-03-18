const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatName: { type: String, default: '' },
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
