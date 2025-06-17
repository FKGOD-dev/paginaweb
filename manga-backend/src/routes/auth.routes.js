const express = require('express');
const router = express.Router();

// Placeholder authentication routes
router.post('/login', (req, res) => {
  res.json({ message: 'login not implemented' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'register not implemented' });
});

module.exports = router;
