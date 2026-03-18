const User = require("../models/User");

exports.getUsers = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.json(users);
};