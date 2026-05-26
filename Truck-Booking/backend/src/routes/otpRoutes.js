import { Router } from 'express';
import {
    sendRegistrationOTP,
    verifyRegistrationOTP,
    resendOTP,
    sendPasswordResetOTP,
    verifyPasswordResetOTP
} from '../controllers/otpController.js';

const router = Router();

// Registration OTP
router.post('/send', sendRegistrationOTP);
router.post('/verify', verifyRegistrationOTP);
router.post('/resend', resendOTP);

// Password Reset OTP
router.post('/password-reset/send', sendPasswordResetOTP);
router.post('/password-reset/verify', verifyPasswordResetOTP);

export default router;
