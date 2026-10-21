const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, authController.updateProfile);
router.post('/addresses', requireAuth, authController.addAddress);
router.delete('/addresses/:addressId', requireAuth, authController.deleteAddress);
router.post('/forgot-password', authLimiter, authController.forgotPassword);

module.exports = router;
