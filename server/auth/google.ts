import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { storage } from '../storage';

export function setupGoogleAuth() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn('Google OAuth credentials not provided. Authentication will be disabled.');
        return;
    }

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                console.log('Google OAuth profile received:', {
                    id: profile.id,
                    displayName: profile.displayName,
                    emails: profile.emails,
                });

                const userData = {
                    id: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
                    lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                };

                console.log('Creating user with data:', userData);

                const user = await storage.upsertUser(userData);
                console.log('User upserted successfully:', user);

                try {
                    const existingConsent = await storage.getLatestGdprConsent(user.id);
                    if (!existingConsent) {
                        await storage.recordGdprConsent(user.id);
                        console.log('GDPR consent recorded for OAuth user:', user.id);
                    }
                } catch (error) {
                    console.error('Error recording GDPR consent:', error);
                }

                return done(null, user);
            } catch (error) {
                console.error('OAuth callback error:', error);
                return done(null, undefined);
            }
        }
    ));

    passport.serializeUser((user: any, done) => {
        console.log('Serializing user:', user);
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            console.log('Deserializing user with ID:', id);

            const { db } = await import('../db');
            const { users } = await import('@shared/schema');
            const { eq } = await import('drizzle-orm');

            const [user] = await db.select().from(users).where(eq(users.id, id));

            if (!user) {
                console.log('User not found during deserialization:', id);
                return done(null, false);
            }
            console.log('User deserialized successfully:', user.email);
            done(null, user);
        } catch (error) {
            console.error('Error deserializing user:', error);
            done(error, null);
        }
    });
}

export function requireAuth(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}