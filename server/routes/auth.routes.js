import { Router } from 'express';
import { login, register, getCurrentUser, logout, forgotPassword, verifyOtp, resetPassword, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

const loginLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 12,
	message: 'Too many login attempts. Please wait before retrying.'
});

const registerLimiter = createRateLimiter({
	windowMs: 30 * 60 * 1000,
	max: 8,
	message: 'Too many registration attempts. Please try again later.'
});

const forgotPasswordLimiter = createRateLimiter({
	windowMs: 10 * 60 * 1000,
	max: 5,
	message: 'Too many OTP requests. Please wait before requesting again.',
	keyBy: (req) => req.body?.email || '',
});

const verifyOtpLimiter = createRateLimiter({
	windowMs: 10 * 60 * 1000,
	max: 10,
	message: 'Too many OTP verification attempts. Please request a new OTP.',
	keyBy: (req) => req.body?.email || '',
});

const resetPasswordLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 6,
	message: 'Too many password reset attempts. Please wait and retry.',
	keyBy: (req) => req.body?.email || '',
});

router.post('/login', loginLimiter, login);
router.post('/register', registerLimiter, register);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

export default router;
