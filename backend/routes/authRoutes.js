const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// The 'protect' middleware runs BEFORE the response
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;