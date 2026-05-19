const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');

// POST /api/chat - Public chatbot endpoint
router.post('/', chat);

module.exports = router;
