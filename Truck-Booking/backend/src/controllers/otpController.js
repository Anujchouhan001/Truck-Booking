import { Otp } from '../models/Otp.js';
import { User } from '../models/User.js';
import { sendOTPEmail } from '../services/emailService.js';
import { hashPassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';

// Rate limiting: Max 3 OTP requests per email per hour
const OTP_RATE_LIMIT = 3;
const OTP_RATE_LIMIT_WINDOW = 60 * 60 * 1000; 
const OTP_EXPIRY_MINUTES = 10;

// OTP for registration
export async function sendRegistrationOTP(req, res) {
    try {
        const { email, name, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered. Please login instead.' });
        }

        
        const recentOtps = await Otp.countDocuments({
            email: email.toLowerCase(),
            purpose: 'registration',
            createdAt: { $gte: new Date(Date.now() - OTP_RATE_LIMIT_WINDOW) }
        });

        if (recentOtps >= OTP_RATE_LIMIT) {
            return res.status(429).json({
                message: 'Too many OTP requests. Please try again later.',
                retryAfter: OTP_RATE_LIMIT_WINDOW / 1000 / 60 
            });
        }

        await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });

        const otp = Otp.generateOTP(6);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        
        const hashedPassword = await hashPassword(password);

        await Otp.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'registration',
            expiresAt,
            tempData: JSON.stringify({ name, passwordHash: hashedPassword })
        });

        await sendOTPEmail(email, otp, 'registration');

        res.json({
            message: 'OTP sent successfully',
            email: email.toLowerCase(),
            expiresIn: OTP_EXPIRY_MINUTES * 60 
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to send OTP' });
    }
}

export async function verifyRegistrationOTP(req, res) {
    try {
        const { email, otp, name, password } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: 'registration'
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        if (otpRecord.isExpired()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        if (otpRecord.isMaxAttemptsExceeded()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
            return res.status(400).json({
                message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
                remainingAttempts
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(409).json({ message: 'Email already registered. Please login.' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash: hashedPassword,
            name: name || '',
            authProvider: 'local'
        });

        await Otp.deleteOne({ _id: otpRecord._id });

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to verify OTP' });
    }
}

export async function resendOTP(req, res) {
    try {
        const { email, password, name, purpose = 'registration' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const recentOtps = await Otp.countDocuments({
            email: email.toLowerCase(),
            purpose,
            createdAt: { $gte: new Date(Date.now() - OTP_RATE_LIMIT_WINDOW) }
        });

        if (recentOtps >= OTP_RATE_LIMIT) {
            return res.status(429).json({
                message: 'Too many OTP requests. Please try again later.',
                retryAfter: OTP_RATE_LIMIT_WINDOW / 1000 / 60
            });
        }

        if (purpose === 'registration') {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already registered. Please login.' });
            }
        }

        await Otp.deleteMany({ email: email.toLowerCase(), purpose });

        const otp = Otp.generateOTP(6);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        if (purpose === 'registration' && password) {
            const hashedPassword = await hashPassword(password);
            await Otp.create({
                email: email.toLowerCase(),
                otp,
                purpose,
                expiresAt
            });
        } else {
            await Otp.create({
                email: email.toLowerCase(),
                otp,
                purpose,
                expiresAt
            });
        }

        await sendOTPEmail(email, otp, purpose);

        res.json({
            message: 'New OTP sent successfully',
            expiresIn: OTP_EXPIRY_MINUTES * 60
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to resend OTP' });
    }
}

export async function sendPasswordResetOTP(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({
                message: 'If an account exists with this email, you will receive a password reset code.',
                email: email.toLowerCase(),
                expiresIn: OTP_EXPIRY_MINUTES * 60
            });
        }

        if (user.authProvider === 'google' && !user.passwordHash) {
            return res.status(400).json({
                message: 'This account uses Google Sign-In. Please login with Google instead.'
            });
        }

        const recentOtps = await Otp.countDocuments({
            email: email.toLowerCase(),
            purpose: 'password-reset',
            createdAt: { $gte: new Date(Date.now() - OTP_RATE_LIMIT_WINDOW) }
        });

        if (recentOtps >= OTP_RATE_LIMIT) {
            return res.status(429).json({
                message: 'Too many password reset requests. Please try again later.',
                retryAfter: OTP_RATE_LIMIT_WINDOW / 1000 / 60
            });
        }

        await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'password-reset' });

        const otp = Otp.generateOTP(6);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await Otp.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'password-reset',
            expiresAt
        });

        await sendOTPEmail(email, otp, 'password-reset');

        res.json({
            message: 'Password reset code sent to your email.',
            email: email.toLowerCase(),
            expiresIn: OTP_EXPIRY_MINUTES * 60
        });

    } catch (error) {
        console.error('Send password reset OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to send password reset code' });
    }
}

export async function verifyPasswordResetOTP(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters with uppercase, lowercase, and special character'
            });
        }

        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: 'password-reset'
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'No reset code found. Please request a new one.' });
        }

        // Check if expired
        if (otpRecord.isExpired()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
        }

        // Check max attempts
        if (otpRecord.isMaxAttemptsExceeded()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'Too many failed attempts. Please request a new code.' });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
            return res.status(400).json({
                message: `Invalid code. ${remainingAttempts} attempts remaining.`,
                remainingAttempts
            });
        }

        // OTP verified! Update password
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'User not found' });
        }

        // Hash and update password
        const hashedPassword = await hashPassword(newPassword);
        user.passwordHash = hashedPassword;
        await user.save();

        // Delete OTP record
        await Otp.deleteOne({ _id: otpRecord._id });

        res.json({
            message: 'Password reset successful! You can now login with your new password.'
        });

    } catch (error) {
        console.error('Verify password reset OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to reset password' });
    }
}
