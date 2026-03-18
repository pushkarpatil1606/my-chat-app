const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {

  const { content, chat, image, file } = req.body;

  if (!content && !image && !file) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  const msg = new Message({
    sender: req.user._id,
    chat: chat,
    content,
    image,
    file
  });

  await msg.save();

  await Chat.findByIdAndUpdate(chat, { updatedAt: Date.now() });

  const populated = await Message.findById(msg._id)
    .populate('sender', 'name email avatar')
    .populate('chat');

  res.status(201).json(populated);
};

exports.getMessages = async (req, res) => {

  const chatId = req.params.chatId;

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 });

  res.json(messages);
};

exports.markAsSeen = async (req, res) => {

  const { chatId } = req.body;

  await Message.updateMany(
    { chat: chatId, sender: { $ne: req.user._id }, seen: false },
    { $set: { seen: true } }
  );

  res.json({ ok: true });

};