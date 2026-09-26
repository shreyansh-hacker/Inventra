import { Router } from 'express';
import { login, register, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

// Fallbacks for forgot password demo flows
router.post('/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Password reset link dispatched to authorized corporate address.' });
});
router.post('/verify-otp', (req, res) => {
  res.json({ success: true, message: 'OTP verified successfully.' });
});
router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password updated successfully. Please log in.' });
});

export default router;
