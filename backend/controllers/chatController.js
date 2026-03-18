const Chat = require('../models/Chat');
const User = require('../models/User');

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  const loggedUserId = req.user._id;

  if (!userId) return res.status(400).json({ message: 'UserId param not sent' });

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [loggedUserId, userId] }
  }).populate('users', '-password');

  if (chat) return res.json(chat);

  const newChat = new Chat({
    chatName: 'sender',
    users: [loggedUserId, userId],
    isGroupChat: false
  });

  await newChat.save();
  chat = await Chat.findById(newChat._id).populate('users', '-password');
  res.status(201).json(chat);
};

exports.fetchChats = async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
    .populate('users', '-password')
    .sort({ updatedAt: -1 });
  res.json(chats);
};

exports.createGroup = async (req, res) => {
  const { name, userIds } = req.body;
  if (!name || !userIds || userIds.length < 2) return res.status(400).json({ message: 'Provide a name and at least 2 users' });

  const chat = new Chat({
    chatName: name,
    users: [...userIds, req.user._id],
    isGroupChat: true,
    groupAdmin: req.user._id
  });
  await chat.save();
  const fullChat = await Chat.findById(chat._id).populate('users', '-password').populate('groupAdmin', '-password');
  res.status(201).json(fullChat);
};
