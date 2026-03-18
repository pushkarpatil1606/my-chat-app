const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { sendMessage, getMessages, markAsSeen } = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);
router.put('/seen', protect, markAsSeen);

module.exports = router;
