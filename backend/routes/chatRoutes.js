const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { accessChat, fetchChats, createGroup } = require('../controllers/chatController');

router.post('/access', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/group', protect, createGroup);

module.exports = router;
