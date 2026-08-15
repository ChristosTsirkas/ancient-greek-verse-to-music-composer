// noinspection JSDeprecatedSymbols,JSUnusedLocalSymbols

import 'dotenv/config';
// All API routes for the app: session/auth setup, MIDI generation
// endpoint (the actual verse-to-music pipeline), file downloads, and
// wiring in the admin routes from ./routes/admin.
import type {Express}                                       from "express";
import {createServer, type Server}                          from "http";
import {storage}                                            from "./storage";
import {requireAuth, setupGoogleAuth}                       from "./auth/google";
import {checkUsageLimits}                                   from "./middleware/usage-limits";
import {midiGenerationSchema}                               from "@shared/schema";
import {MetricalAnalysisService}                            from "./services/metrical-analysis";
import {MidiGeneratorService}                               from "./services/midi-generator";
import passport                                             from "passport";
import session                                              from "express-session";
import connectPg                                            from "connect-pg-simple";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {basename, join}                                     from "path";

// Use type augmentation properly - no duplicate declarations
// We'll use 'any' for session and user to avoid conflicts with existing types

// GDPR exports are intended to open directly in localized spreadsheet apps.
// `sep=;` makes Excel use the semicolon delimiter independently of the host
// locale; BOM preserves UTF-8 Greek text. Quote every value, escape embedded
// quotes/newlines, and neutralize spreadsheet formulas in user-controlled data.
const csvCell = (value: unknown): string => {
    let text = value instanceof Date
               ? value.toISOString()
               : value === null || value === undefined ? "" : String(value);
    // Formula injection applies to textual spreadsheet cells. Preserve actual
    // numeric values (including negative numbers) as numbers.
    if (typeof value === "string" && /^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g,
                            '""')}"`;
};

const csvRow = (values: unknown[]): string => values.map(csvCell).join(";");
const csvDocument = (rows: unknown[][]): string => `\uFEFFsep=;\r\n${rows.map(csvRow).join("\r\n")}\r\n`;

export async function registerRoutes(app: Express): Promise<Server> {
    // Session configuration - Fixed for production stability
    const pgStore = connectPg(session);
    app.use(session({
                        store:             new pgStore({
                                                           conString:            process.env.DATABASE_URL,
                                                           createTableIfMissing: true,
                                                           ttl:                  7 * 24 * 60 * 60, // 1 week in seconds
                                                           tableName:            'sessions',
                                                           schemaName:           'public',
                                                           pruneSessionInterval: 60 * 60 * 1000, // Prune expired sessions every hour
                                                       }),
                        secret:            process.env.SESSION_SECRET || 'your-secret-key',
                        resave:            false,
                        saveUninitialized: false,
                        rolling:           true, // Reset expiration on activity
                        cookie:            {
                            secure:   false, // Keep false for deployment compatibility
                            httpOnly: true, // Secure cookie handling
                            maxAge:   7 * 24 * 60 * 60 * 1000, // 1 week
                            sameSite: 'lax',
                        },
                        name:              'connect.sid',
                    }));
    
    // Setup Google OAuth first
    setupGoogleAuth();
    
    // Passport middleware (only if OAuth is configured)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
    
    // Auth routes (only if Google OAuth is configured)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        app.get('/auth/google',
                passport.authenticate('google',
                                      { scope: ['profile', 'email'] }));
        
        app.get('/auth/google/callback',
                (req, res, next) => {
                    console.log('OAuth callback hit, starting authentication...');
                    passport.authenticate('google',
                                          {
                                              failureRedirect: '/?error=auth_failed',
                                          })(
                        req,
                        res,
                        next);
                },
                (req, res) => {
                    console.log('OAuth callback completed successfully');
                    console.log('Authenticated user:',
                                req.user);
                    console.log('Session ID:',
                                req.sessionID);
                    console.log('isAuthenticated:',
                                (
                                    req as any
                                ).isAuthenticated ? (
                                    req as any
                                ).isAuthenticated() : false);
                    
                    if (req.user) {
                        console.log('User authenticated successfully, redirecting to home');
                        res.redirect('/');
                    } else {
                        console.log('Authentication failed, no user object');
                        res.redirect('/?error=auth_failed');
                    }
                },
        );
        
        app.post('/auth/logout',
                 (req, res) => {
                     console.log('Logout requested for user:',
                                 (
                                     req.user as any
                                 )?.id);
                     (
                         req as any
                     ).logout((err: any) => {
                         if (err) {
                             console.error('Logout error:',
                                           err);
                             return res.status(500).json({ error: 'Logout failed' });
                         }
                         req.session?.destroy((destroyErr) => {
                             if (destroyErr) {
                                 console.error('Session destroy error:',
                                               destroyErr);
                             }
                             res.clearCookie('greek-music-session');
                             res.json({ success: true });
                         });
                     });
                 });
    } else {
        // Fallback routes when OAuth is not configured
        app.get('/auth/google',
                (_req, res) => {
                    res.status(503).json({ error: 'Authentication not configured' });
                });
        
        app.post('/auth/logout',
                 (_req, res) => {
                     res.status(503).json({ error: 'Authentication not configured' });
                 });
    }
    
    app.get('/api/auth/user',
            async (req, res) => {
                const reqAny = req as any;
                console.log('Auth check - isAuthenticated:',
                            reqAny.isAuthenticated ? reqAny.isAuthenticated() : false);
                console.log('Auth check - session ID:',
                            req.sessionID);
                console.log('Auth check - session exists:',
                            !!req.session);
                console.log('Auth check - user exists:',
                            !!req.user);
                console.log('Auth check - passport user:',
                            (
                                req.session as any
                            )?.passport?.user);
                console.log('Auth check - full session:',
                            JSON.stringify(req.session,
                                           null,
                                           2));
                
                const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                const hasUser = !!req.user;
                const hasPassportUser = !!(
                    req.session as any
                )?.passport?.user;
                
                console.log('Auth details - isAuth:',
                            isAuth,
                            'hasUser:',
                            hasUser,
                            'hasPassportUser:',
                            hasPassportUser);
                
                if (isAuth && hasUser) {
                    console.log('Returning user data:',
                                req.user);
                    if (req.session) req.session.touch();
                    res.json(req.user);
                } else if (hasPassportUser) {
                    // Direct SQL lookup for session-based authentication
                    try {
                        console.log('Attempting direct user lookup for session user:',
                                    (
                                        req.session as any
                                    )?.passport?.user);
                        const { db } = await import('./db');
                        const { users } = await import('@shared/schema');
                        const { eq } = await import('drizzle-orm');
                        
                        const [user] = await db.select().from(users).where(eq(users.id,
                                                                              (
                                                                                  req.session as any
                                                                              )?.passport?.user));
                        
                        if (user) {
                            console.log('Found user via direct lookup:',
                                        (
                                            user as any
                                        ).email);
                            req.user = user; // Populate req.user for future requests
                            if (req.session) req.session.touch();
                            res.json(user);
                            return;
                        } else {
                            console.log('User not found in database for ID:',
                                        (
                                            req.session as any
                                        )?.passport?.user);
                        }
                    }
                    catch (error) {
                        console.error('Direct user lookup failed:',
                                      error);
                    }
                    
                    console.log('Authentication failed - user not found in database');
                    res.status(401).json({ error: 'Not authenticated' });
                } else {
                    console.log('Authentication failed - no session or user data');
                    res.status(401).json({ error: 'Not authenticated' });
                }
            });
    
    // Usage status endpoint
    app.get('/api/usage/status',
            async (req: any, res) => {
                try {
                    // Ensure session is refreshed
                    if (req.session) {
                        req.session.touch();
                    }
                    
                    const isAuth = req.isAuthenticated && req.isAuthenticated();
                    const hasUser = !!req.user;
                    
                    if (isAuth && hasUser) {
                        const user = req.user;
                        console.log('Usage status check for authenticated user:',
                                    (
                                        user as any
                                    ).email);
                        const isUnlimited = await storage.checkUserIsUnlimited((
                                                                                   user as any
                                                                               ).email);
                        
                        if (isUnlimited) {
                            return res.json({
                                                isAuthenticated: true,
                                                isUnlimited:     true,
                                                dailyLimit:      null,
                                                dailyUsed:       0,
                                                remaining:       null,
                                            });
                        }
                        
                        const dailyUsed = await storage.getUserDailyVerseCount((
                                                                                   user as any
                                                                               ).id);
                        const dailyLimit = await storage.getUserDailyLimit((
                                                                               user as any
                                                                           ).id);
                        
                        res.json({
                                     isAuthenticated: true,
                                     isUnlimited:     false,
                                     dailyLimit,
                                     dailyUsed,
                                     remaining:       Math.max(0,
                                                               dailyLimit - dailyUsed),
                                 });
                    } else {
                        const clientIP = (
                            req.ip || req.connection?.remoteAddress || 'unknown'
                        ).replace(/^::ffff:/,
                                  '');
                        const usage = await storage.getAnonymousUsage(clientIP);
                        const totalLimit = 10;
                        const totalUsed = usage?.verseCount || 0;
                        
                        res.json({
                                     isAuthenticated: false,
                                     isUnlimited:     false,
                                     totalLimit,
                                     totalUsed,
                                     remaining:       Math.max(0,
                                                               totalLimit - totalUsed),
                                 });
                    }
                }
                catch (error) {
                    console.error("Error fetching usage status:",
                                  error);
                    res.status(500).json({ error: "Failed to fetch usage status" });
                }
            });
    
    const metricalAnalysis = new MetricalAnalysisService();
    const midiGenerator = new MidiGeneratorService();
    
    // GDPR Compliance Routes
    app.get('/api/gdpr/midi-export',
            async (req, res) => {
                const reqAny = req as any;
                const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                const hasUser = !!req.user;
                
                if (!isAuth || !hasUser) {
                    return res.status(401).json({ error: 'Authentication required' });
                }
                try {
                    const user = req.user as any;
                    const userData = await storage.getUser(user.id);
                    const downloads = await storage.getUserDownloads(user.id,
                                                                     1000);
                    
                    const csvRows: unknown[][] = [
                        [
                            "User ID", "First name", "Last name", "Email", "Account created (ISO 8601 UTC)", "Download ID",
                            "Friendly name", "File name", "Download date (ISO 8601 UTC)",
                        ],
                    ];
                    
                    console.log('CSV Export - User data:',
                                userData);
                    console.log('CSV Export - Downloads count:',
                                downloads.length);
                    
                    // Process downloads with friendly names
                    for (const d of downloads) {
                        const midiFile = await storage.getMidiFile(d.midiFileId);
                        const friendlyName = midiFile?.friendlyName || d.friendlyName || 'Unknown';
                        console.log('CSV Export - Processing download:',
                                    {
                                        id:       d.id,
                                        filename: d.filename,
                                        friendlyName,
                                    });
                        csvRows.push([
                                         userData?.id, userData?.firstName, userData?.lastName,
                                         (
                                             userData as any
                                         )?.email, userData?.createdAt, d.id,
                                         friendlyName, d.filename,
                                         d.downloadedAt,
                                     ]);
                    }
                    
                    const csvContent = csvDocument(csvRows);
                    
                    res.setHeader('Content-Type',
                                  'text/csv; charset=utf-8');
                    res.setHeader('Content-Disposition',
                                  'attachment; filename="user-midi-files.csv"');
                    res.send(csvContent);
                }
                catch (error) {
                    console.error('GDPR MIDI export error:',
                                  error);
                    res.status(500).json({ error: 'Failed to export MIDI data' });
                }
            });
    
    // GDPR user data export endpoint
    app.get('/api/gdpr/user-export',
            async (req, res) => {
                const reqAny = req as any;
                const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                const hasUser = !!req.user;
                
                if (!isAuth || !hasUser) {
                    return res.status(401).json({ error: 'Authentication required' });
                }
                try {
                    const user = req.user as any;
                    const userData = await storage.getUser(user.id);
                    const downloads = await storage.getUserDownloads(user.id,
                                                                     1000);
                    
                    const csvRows: unknown[][] = [["Section", "Field", "Value"]];
                    
                    console.log('User Export - User data:',
                                userData);
                    console.log('User Export - Downloads count:',
                                downloads.length);
                    
                    // Add user profile data
                    csvRows.push(["User profile", "User ID", userData?.id]);
                    csvRows.push(["User profile", "First name", userData?.firstName]);
                    csvRows.push(["User profile", "Last name", userData?.lastName]);
                    csvRows.push([
                                     "User profile", "Email", (
                            userData as any
                        )?.email,
                                 ]);
                    csvRows.push(["User profile", "Account created (ISO 8601 UTC)", userData?.createdAt]);
                    csvRows.push(["User profile", "Last updated (ISO 8601 UTC)", userData?.updatedAt]);
                    csvRows.push(["User profile", "Daily verse limit", userData?.dailyVerseLimit || "Unlimited"]);
                    
                    // Add summary statistics
                    csvRows.push([]);
                    csvRows.push(["Account statistics", "Field", "Value"]);
                    csvRows.push(["Account statistics", "Total downloads", downloads.length]);
                    csvRows.push([
                                     "Account statistics", "Account age (days)", userData?.createdAt ? Math.max(0,
                                                                                                                Math.floor((
                                                                                                                               new Date().getTime() - new Date(userData.createdAt).getTime()
                                                                                                                           ) / (
                                                                                                                               1000 * 60 * 60 * 24
                                                                                                                           ))) : "Unknown",
                                 ]);
                    
                    const csvContent = csvDocument(csvRows);
                    
                    res.setHeader('Content-Type',
                                  'text/csv; charset=utf-8');
                    res.setHeader('Content-Disposition',
                                  'attachment; filename="user-profile-data.csv"');
                    res.send(csvContent);
                }
                catch (error) {
                    console.error('GDPR user export error:',
                                  error);
                    res.status(500).json({ error: 'Failed to export user data' });
                }
            });
    
    app.delete('/api/gdpr/delete-account',
               async (req, res) => {
                   const reqAny = req as any;
                   console.log('GDPR delete endpoint hit - isAuthenticated:',
                               reqAny.isAuthenticated());
                   console.log('GDPR delete endpoint hit - user:',
                               (
                                   req.user as any
                               )?.email);
                   
                   const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                   const hasUser = !!req.user;
                   
                   if (!isAuth || !hasUser) {
                       console.log('GDPR delete - not authenticated');
                       return res.status(401).json({ error: 'Authentication required' });
                   }
                   
                   try {
                       const user = req.user as any;
                       
                       // Retrieve the complete history, not only the subset shown
                       // in the UI, so every generated MIDI and score is erased.
                       const downloads = await storage.getUserDownloads(user.id);
                       const generatedMidiFiles = await storage.getUserMidiFiles(user.id);
                       const midiFileIds = new Set([
                                                       ...downloads.map(download => download.midiFileId),
                                                       ...generatedMidiFiles.map(midiFile => midiFile.id),
                                                   ]);
                       for (const midiFileId of Array.from(midiFileIds)) {
                           await storage.deleteMidiFile(midiFileId);
                       }
                       
                       // Database deletion cascades the remaining user downloads,
                       // GDPR consents, and daily usage. DatabaseStorage also
                       // removes every session whose Passport user is this account.
                       await storage.deleteUser(user.id);
                       
                       // Sessions have already been removed from the server. Clear
                       // the cookie configured for express-session in the browser.
                       res.clearCookie('connect.sid');
                       res.json({
                                    message: 'Account and all associated data have been permanently deleted as per GDPR Article 17 (Right to erasure)',
                                });
                   }
                   catch (error) {
                       console.error('GDPR account deletion error:',
                                     error);
                       res.status(500).json({ error: 'Failed to delete account' });
                   }
               });
    
    app.put('/api/gdpr/update-data',
            async (req, res) => {
                const reqAny = req as any;
                console.log('GDPR update endpoint hit - isAuthenticated:',
                            reqAny.isAuthenticated());
                console.log('GDPR update endpoint hit - user:',
                            (
                                req.user as any
                            )?.email);
                console.log('GDPR update request body:',
                            req.body);
                
                const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                const hasUser = !!req.user;
                
                if (!isAuth || !hasUser) {
                    console.log('GDPR update - not authenticated');
                    return res.status(401).json({ error: 'Authentication required' });
                }
                
                try {
                    const user = req.user as any;
                    const {
                              firstName,
                              lastName,
                          } = req.body;
                    
                    // Build update object based on what was provided
                    const updateData: any = {};
                    if (typeof firstName === "string" && firstName.trim()) updateData.firstName = firstName.trim();
                    if (typeof lastName === "string" && lastName.trim()) updateData.lastName = lastName.trim();
                    
                    if (Object.keys(updateData).length === 0) {
                        return res.status(400).json({ error: 'At least one field (firstName or lastName) is required' });
                    }
                    
                    console.log('GDPR update - User ID:',
                                user.id,
                                'Update data:',
                                updateData);
                    await storage.updateUserData(user.id,
                                                 updateData);
                    const updatedUser = await storage.getUser(user.id);
                    console.log('GDPR update - Updated user:',
                                updatedUser);
                    
                    // Update the session user data to reflect changes immediately
                    req.user = { ...req.user, ...updatedUser };
                    
                    res.json({
                                 message:     'Data updated successfully as per GDPR Article 16 (Right to rectification)',
                                 updatedData: updateData,
                                 user:        updatedUser,
                             });
                }
                catch (error) {
                    console.error('GDPR data update error:',
                                  error);
                    res.status(500).json({ error: 'Failed to update data' });
                }
            });
    
    // User downloads endpoint for history
    app.get('/api/user/downloads',
            async (req, res) => {
                const reqAny = req as any;
                console.log('Downloads endpoint hit - isAuthenticated:',
                            reqAny.isAuthenticated());
                console.log('Downloads endpoint hit - user:',
                            (
                                req.user as any
                            )?.email);
                
                const isAuth = reqAny.isAuthenticated && reqAny.isAuthenticated();
                const hasUser = !!req.user;
                
                if (!isAuth || !hasUser) {
                    console.log('Downloads endpoint - not authenticated');
                    return res.status(401).json({ error: 'Authentication required' });
                }
                
                try {
                    const user = req.user as any;
                    console.log('Fetching downloads for user:',
                                user.id);
                    const downloads = await storage.getUserDownloads(user.id,
                                                                     1000);
                    console.log('Downloads found:',
                                downloads.length);
                    console.log('Downloads data:',
                                downloads);
                    res.json(downloads);
                }
                catch (error) {
                    console.error('Downloads fetch error:',
                                  error);
                    res.status(500).json({ error: 'Failed to fetch downloads' });
                }
            });
    
    // Generated downloads are kept by format so score exports never mingle
    // with the MIDI files that drive history and browser playback.
    const midiDir = join(process.cwd(),
                         'downloads',
                         'midi');
    const scoresDir = join(process.cwd(),
                           'downloads',
                           'scores');
    if (!existsSync(midiDir)) {
        mkdirSync(midiDir,
                  { recursive: true });
    }
    if (!existsSync(scoresDir)) mkdirSync(scoresDir,
                                          { recursive: true });
    
    app.post("/api/generate-midi",
             checkUsageLimits,
             async (req: any, res) => {
                 try {
                     const isAuthenticated = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
                     const authenticatedUser = isAuthenticated ? req.user as { id: string } : undefined;
                     if (isAuthenticated && !authenticatedUser?.id) {
                         return res.status(401).json({
                                                         success: false,
                                                         error:   'Your sign-in session could not be read. Please sign in again.',
                                                     });
                     }
                     const validatedData = midiGenerationSchema.parse(req.body);
                     
                     // Normalize all dash types to standard hyphens before processing
                     const normalizedVerses = validatedData.verses.map(verse => (
                         {
                             ...verse,
                             metrics: verse.metrics
                                           .replace(/[—–−]/g,
                                                    '-')  // Em dash, en dash, minus to hyphen
                                           .replace(/[υΥ]/g,
                                                    'U')   // Greek upsilon (small & capital) to uppercase U
                                           .replace(/∪/g,
                                                    'U'),    // Unicode breve to U
                         }
                     ));
                     
                     // Validate arsis/thesis patterns if provided
                     for (const verse of normalizedVerses) {
                         if (verse.arsisThesisPattern) {
                             // Count metrical elements (U and - characters) in the metrics pattern
                             const metricalElements = verse.metrics.replace(/\s+/g,
                                                                            '').split('');
                             const metricalCount = metricalElements.filter(char => char === 'U' || char === '-').length;
                             const patternElements = verse.arsisThesisPattern.split('-');
                             
                             if (patternElements.length !== metricalCount) {
                                 return res.status(400).json({
                                                                 success: false,
                                                                 error:   `Arsis/Thesis pattern length (${patternElements.length}) does not match metrical elements count (${metricalCount}) for verse: "${verse.text.substring(0,
                                                                                                                                                                                                                                30)}..."`,
                                                             });
                             }
                             
                             const hasIncompletePattern = patternElements.some(p => p !== 'A' && p !== 'T');
                             if (hasIncompletePattern) {
                                 return res.status(400).json({
                                                                 success: false,
                                                                 error:   `All metrical elements must be marked as either Arsis (A) or Thesis (T) in verse: "${verse.text.substring(0,
                                                                                                                                                                                    30)}..."`,
                                                             });
                             }
                         }
                     }
                     
                     // Process verses through metrical analysis
                     const processedVerses = metricalAnalysis.processVerses(normalizedVerses);
                     
                     // Check WAV support
                     if (validatedData.outputFormat === 'wav') {
                         res.status(501).json({
                                                  success: false,
                                                  error:   "WAV export not yet implemented. Please use MIDI format and convert externally with tools like FluidSynth or TiMidity++.",
                                              });
                         return;
                     }
                     
                     
                     // Check if arsis/thesis patterns are active
                     const hasArsisThesisPatterns = validatedData.verses.some(verse =>
                                                                                  verse.arsisThesisPattern && verse.arsisThesisPattern.length > 0);
                     
                     // Automatically disable metronome, accent and vocal guide tracks when arsis/thesis is active
                     // This prevents timing misalignment since arsis/thesis provides its own rhythmic emphasis and timing
                     const includeMetronome = hasArsisThesisPatterns ? false : validatedData.includeMetronome;
                     const includeAccentTrack = hasArsisThesisPatterns ? false : (
                         validatedData.includeAccentTrack || false
                     );
                     const includeVocalGuide = hasArsisThesisPatterns ? false : (
                         validatedData.includeVocalGuide || false
                     );
                     
                     // Generate both exports from one set of generated events.
                     // The MusicXML score covers every processed verse's primary
                     // musical track; auxiliary reference tracks stay MIDI-only.
                     const generatedFiles = midiGenerator.generateWithMusicXml(
                         processedVerses,
                         validatedData.instrument,
                         validatedData.tempo,
                         validatedData.mode,
                         includeMetronome,
                         validatedData.experimental,
                         includeAccentTrack,
                         includeVocalGuide,
                         validatedData.allowMelody,
                     );
                     
                     // Save MIDI file with user/guest prefix
                     const timestamp = Date.now();
                     const randomSuffix = Math.floor(Date.now() / 1000).toString(36) + Math.floor(timestamp % 1000000).toString(36);
                     const userPrefix = authenticatedUser ? `user_${authenticatedUser.id}` : `guest_${Math.floor(Date.now() / 1000).toString(36).substring(2,
                                                                                                                                                           8)}`;
                     const friendlyName = validatedData.friendlyName || `Request ${timestamp.toString().slice(-6)}`;
                     const filename = `${userPrefix}_${timestamp}_${randomSuffix}.mid`;
                     const scoreFilename = filename.replace(/\.mid$/i,
                                                            '.musicxml');
                     writeFileSync(join(midiDir,
                                        filename),
                                   generatedFiles.midiBuffer);
                     writeFileSync(join(scoresDir,
                                        scoreFilename),
                                   generatedFiles.musicXml,
                                   'utf8');
                     
                     // Store metadata in storage
                     console.log('Creating MIDI file record:',
                                 {
                                     filename,
                                     friendlyName,
                                     verseCount: req.verseCount || validatedData.verses.length,
                                 });
                     let midiFile;
                     try {
                         midiFile = await storage.createMidiFile({
                                                                     filename,
                                                                     friendlyName,
                                                                     verses:     validatedData.verses,
                                                                     instrument: validatedData.instrument,
                                                                     tempo:      validatedData.tempo,
                                                                     mode:       validatedData.mode,
                                                                     verseCount: req.verseCount || validatedData.verses.length,
                                                                 });
                         console.log('MIDI file created with ID:',
                                     midiFile.id);
                     }
                     catch (error) {
                         console.error('Critical error creating MIDI file record:',
                                       error);
                         // Guests can still download a generated file without database storage.
                         // Signed-in users must not receive a false success response: their
                         // file needs a metadata row before it can appear in history.
                         if (authenticatedUser) {
                             return res.status(500).json({
                                                             success: false,
                                                             error:   'Could not save the generated MIDI file to your download history.',
                                                         });
                         }
                         midiFile = {
                             id:         Date.now(),
                             filename,
                             friendlyName,
                             verses:     validatedData.verses,
                             instrument: validatedData.instrument,
                             tempo:      validatedData.tempo,
                             mode:       validatedData.mode,
                             verseCount: req.verseCount || validatedData.verses.length,
                             createdAt:  new Date(),
                         };
                     }
                     
                     // For authenticated users, automatically add to download history
                     if (authenticatedUser) {
                         await storage.recordDownload({
                                                          userId:       authenticatedUser.id,
                                                          midiFileId:   midiFile.id,
                                                          filename:     filename,
                                                          friendlyName: friendlyName,
                                                      });
                         console.log('Added to user download history:',
                                     {
                                         userId: authenticatedUser.id,
                                         filename,
                                         friendlyName,
                                     });
                     }
                     
                     // Update anonymous usage if applicable
                     if (req.updateAnonymousUsage) {
                         await req.updateAnonymousUsage();
                     }
                     
                     res.json({
                                  success:          true,
                                  filename,
                                  midiFileId:       midiFile.id,
                                  downloadUrl:      `/api/download/midi/${filename}`,
                                  scoreFilename,
                                  scoreDownloadUrl: `/api/download/score/${scoreFilename}`,
                                  processedVerses,
                                  includeMetronome: validatedData.includeMetronome,
                              });
                     
                 }
                 catch (error) {
                     console.error('MIDI generation error:',
                                   error);
                     res.status(400).json({
                                              success: false,
                                              error:   error instanceof Error ? error.message : 'Failed to generate MIDI file',
                                          });
                 }
             });
    
    
    const sendDownload = (directory: string, contentType: string) => async (req: any, res: any) => {
        try {
            const filename = basename(req.params.filename);
            const filepath = join(directory,
                                  filename);
            
            if (!existsSync(filepath)) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            // Verify file exists in our storage - commented out but kept for reference
            // const midiFile = await storage.getMidiFileByFilename(filename);
            
            // Temporarily disable this check (effectively losing permissions) because it does not work in new installations.
            // TODO: investigate and fix.
            //if (!midiFile) {
            //return res.status(404).json({ error: 'File not found in records' });
            //}
            
            // Note: Download tracking removed - files are now added to history when generated, not when downloaded
            
            const fileBuffer = readFileSync(filepath);
            
            res.setHeader('Content-Type',
                          contentType);
            res.setHeader('Content-Disposition',
                          `attachment; filename="${filename}"`);
            res.send(fileBuffer);
            
        }
        catch (error) {
            console.error('Download error:',
                          error);
            res.status(500).json({ error: 'Failed to download file' });
        }
    };
    
    app.get("/api/download/midi/:filename",
            sendDownload(midiDir,
                         'audio/midi'));
    app.get("/api/download/score/:filename",
            sendDownload(scoresDir,
                         'application/vnd.recordare.musicxml+xml'));
    // Maintains previously stored generation-history links.
    app.get("/api/download/:filename",
            sendDownload(midiDir,
                         'audio/midi'));
    
    // Delete individual MIDI file endpoint (works for both guests and users)
    app.delete('/api/midi-files/:id',
               async (req, res) => {
                   console.log('DELETE /api/midi-files/:id called with ID:',
                               req.params.id);
                   console.log('User authenticated:',
                               (
                                   req as any
                               ).isAuthenticated ? (
                                   req as any
                               ).isAuthenticated() : false);
                   console.log('User object exists:',
                               !!req.user);
                   
                   try {
                       const midiFileId = parseInt(req.params.id);
                       
                       // For authenticated users, verify ownership through download history
                       if (req.user) {
                           const user = req.user as any;
                           const userDownloads = await storage.getUserDownloads(user.id,
                                                                                1000);
                           const userDownload = userDownloads.find(d => d.midiFileId === midiFileId);
                           
                           if (!userDownload) {
                               return res.status(404).json({ error: 'File not found or access denied' });
                           }
                       }
                       // For guests, allow deletion of any file (they manage their own localStorage)
                       
                       // Delete the MIDI file agnostically - remove from database and try to delete file
                       await storage.deleteMidiFile(midiFileId);
                       
                       res.json({ message: 'File deleted successfully' });
                   }
                   catch (error) {
                       console.error('Delete MIDI file error:',
                                     error);
                       // Even if deletion fails, respond with success to avoid UI issues
                       res.json({ message: 'File deletion attempted' });
                   }
               });
    
    
    // Bulk delete all user downloads endpoint
    app.delete('/api/user/downloads/clear',
               requireAuth,
               async (req, res) => {
                   console.log('DELETE /api/user/downloads/clear called');
                   console.log('User authenticated:',
                               (
                                   req as any
                               ).isAuthenticated ? (
                                   req as any
                               ).isAuthenticated() : false);
                   console.log('User object exists:',
                               !!req.user);
                   
                   try {
                       const user = req.user as any;
                       const downloads = await storage.getUserDownloads(user.id,
                                                                        1000);
                       
                       // Delete all MIDI files for this user
                       for (const download of downloads) {
                           try {
                               await storage.deleteMidiFile(download.midiFileId);
                           }
                           catch (error) {
                               console.warn('Error deleting MIDI file:',
                                            error);
                           }
                       }
                       
                       res.json({ message: `Deleted ${downloads.length} files successfully` });
                   }
                   catch (error) {
                       console.error('Bulk delete error:',
                                     error);
                       res.status(500).json({ error: 'Failed to delete files' });
                   }
               });
    
    return createServer(app);
}
