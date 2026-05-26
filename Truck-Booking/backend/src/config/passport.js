import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';

export function configurePassport() {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' ? 'https://somya-truck-booking.vercel.app/auth/google/callback' : 'http://localhost:4000/auth/google/callback'),
                    scope: ['profile', 'email']
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        let user = await User.findOne({ googleId: profile.id });
                        let isNewUser = false;

                        if (user) {
                            user.name = profile.displayName;
                            if (!user.avatar) {
                                user.avatar = profile.photos?.[0]?.value;
                            }
                            await user.save();
                            user.isNewUser = false;
                            return done(null, user);
                        }

                        const existingEmailUser = await User.findOne({
                            email: profile.emails?.[0]?.value
                        });

                        if (existingEmailUser) {
                            existingEmailUser.googleId = profile.id;
                            existingEmailUser.avatar = profile.photos?.[0]?.value;
                            existingEmailUser.authProvider = existingEmailUser.authProvider === 'local' ? 'local' : 'google';
                            await existingEmailUser.save();
                            existingEmailUser.isNewUser = false;
                            return done(null, existingEmailUser);
                        }

                        user = await User.create({
                            googleId: profile.id,
                            email: profile.emails?.[0]?.value,
                            name: profile.displayName,
                            avatar: profile.photos?.[0]?.value,
                            authProvider: 'google',
                            role: 'customer'
                        });

                        user.isNewUser = true;
                        return done(null, user);
                    } catch (error) {
                        console.error('Google OAuth error:', error);
                        return done(error, null);
                    }
                }
            )
        );
        console.log('✅ Google OAuth Strategy configured');
    } else {
        console.warn('⚠️ Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }

    return passport;
}

export default passport;
