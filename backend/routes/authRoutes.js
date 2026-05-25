const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Profile routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

// Password routes
router.post('/verify-password', protect, authController.verifyPassword);
router.put('/password', protect, authController.updatePassword);

module.exports = router;