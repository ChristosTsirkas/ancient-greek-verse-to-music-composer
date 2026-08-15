import 'dotenv/config';
// Rate-limiting middleware: logged-in users get a per-account daily verse
// limit (unless flagged unlimited); anonymous users get a lifetime cap of
// 10 verses tracked by IP. Attach to any route that generates verses.
import {NextFunction, Request, Response} from 'express';
import {storage}                         from '../storage';

interface UsageLimitRequest extends Request {
    user?: any;
    verseCount?: number;
    updateAnonymousUsage?: (() => Promise<void>); // ✅ Added this property
}

export async function checkUsageLimits(req: UsageLimitRequest, res: Response, next: NextFunction) {
    try {
        const verseCount = req.body.verses?.length || 0;
        req.verseCount = verseCount;
        
        if (req.isAuthenticated && req.isAuthenticated()) {
            // Authenticated user limits
            const user = req.user;
            
            // Check if user has unlimited access
            const isUnlimited = await storage.checkUserIsUnlimited(user.email);
            if (isUnlimited) {
                return next();
            }
            
            // Check daily limit for regular users (customizable per user)
            const dailyCount = await storage.getUserDailyVerseCount(user.id);
            const dailyLimit = await storage.getUserDailyLimit(user.id);
            
            if (dailyCount + verseCount > dailyLimit) {
                return res.status(429).send(`
Daily Limit Reached

You've used ${dailyCount} out of ${dailyLimit} daily verses.

This request for ${verseCount} verse(s) would exceed your daily limit.

Your limit resets at midnight.

Return to the homepage to continue tomorrow.
        `);
            }
            
            return next();
        } else {
            // Anonymous user limits (10 verses total)
            const clientIP = (
                req.ip || 'unknown'
            ).replace(/^::ffff:/, '');
            
            let currentUsage = await storage.getAnonymousUsage(clientIP);
            if (!currentUsage) {
                await storage.recordAnonymousUsage({
                    ipHash: clientIP,  // Use ipHash instead of ipAddress
                    verseCount: 0,
                    lastUsed: new Date(),
                });
                currentUsage = await storage.getAnonymousUsage(clientIP);
            }
            
            const totalUsed = currentUsage?.verseCount || 0;
            const totalLimit = 10;
            
            if (totalUsed + verseCount > totalLimit) {
                return res.status(429).send(`
Verse Limit Reached

You've used ${totalUsed} out of ${totalLimit} free verses available to anonymous users.

This request for ${verseCount} verse(s) would exceed your limit.

Sign in with Google for 100 verses daily!

Return to the homepage to sign in and continue.
        `);
            }
            
            // Store callback to update usage after successful generation
            req.updateAnonymousUsage = async () => {
                await storage.updateAnonymousUsage(clientIP, verseCount);
            };
            
            return next();
        }
    }
    catch (error) {
        console.error('Usage limit check error:', error);
        return res.status(500).json({ error: 'Failed to check usage limits' });
    }
}
