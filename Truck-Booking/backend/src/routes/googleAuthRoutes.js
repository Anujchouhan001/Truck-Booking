import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

// Initiate Google OAuth
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://somya-truck-booking.vercel.app' : 'http://localhost:5173')}/login?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            // Generate JWT token for the authenticated user
            const user = req.user;
            const isNewUser = user.isNewUser || false;

            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                    email: user.email,
                    name: user.name,
                    authProvider: user.authProvider,
                    passwordHash: !!user.passwordHash
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Redirect to frontend with token (and new flag if new user)
            const frontendURL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://somya-truck-booking.vercel.app' : 'http://localhost:5173');
            const newUserParam = isNewUser ? '&new=true' : '';
            res.redirect(`${frontendURL}/oauth/callback?token=${token}${newUserParam}`);
        } catch (error) {
            console.error('Google callback error:', error);
            const frontendURL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://somya-truck-booking.vercel.app' : 'http://localhost:5173');
            res.redirect(`${frontendURL}/login?error=token_generation_failed`);
        }
    }
);

// Get current user info (for verifying token)
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json(decoded);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
