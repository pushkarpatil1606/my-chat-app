const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  content: { type: String },
  image: { type: String },
  file: { type: String },
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
