// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedLocalSymbols

import 'dotenv/config';
import {db}                       from "./db";
import {and, desc, eq, like, sql} from "drizzle-orm";
import {
    type AnonymousUsage,
    dailyUsage,
    type GdprConsent,
    gdprConsents,
    type InsertAnonymousUsage,
    type InsertMidiFile,
    type InsertUserDownload,
    type MidiFile,
    midiFiles,
    type UpsertUser,
    type User,
    type UserDownload,
    userDownloads,
    users,
}                                 from "@shared/schema";

export interface IStorage {
    createMidiFile(midiFile: InsertMidiFile): Promise<MidiFile>;
    
    getMidiFile(id: number): Promise<MidiFile | undefined>;
    
    getMidiFileByFilename(filename: string): Promise<MidiFile | undefined>;
    
    getUserMidiFiles(userId: string): Promise<MidiFile[]>;
    
    deleteMidiFile(id: number): Promise<void>;
    
    getUser(id: string): Promise<User | undefined>;
    
    upsertUser(userData: UpsertUser): Promise<User>;
    
    deleteUser(id: string): Promise<void>;
    
    updateUserData(id: string, data: { name?: string; firstName?: string; lastName?: string }): Promise<void>;
    
    recordGdprConsent(userId: string): Promise<GdprConsent>;
    
    getLatestGdprConsent(userId: string): Promise<GdprConsent | undefined>;
    
    recordDownload(download: InsertUserDownload): Promise<UserDownload>;
    
    getUserDownloads(userId: string, limit?: number): Promise<UserDownload[]>;
    
    getAnonymousUsage(ipAddress: string): Promise<AnonymousUsage | undefined>;
    
    recordAnonymousUsage(usage: InsertAnonymousUsage): Promise<AnonymousUsage>;
    
    updateAnonymousUsage(ipAddress: string, verseCount: number): Promise<void>;
    
    checkUserIsUnlimited(email: string): Promise<boolean>;
    
    getUserDailyVerseCount(userId: string): Promise<number>;
    
    getUserDailyLimit(userId: string): Promise<number>;
    
    recordDailyUsage(userId: string, verseCount: number): Promise<void>;
}

export class MemStorage implements IStorage {
    private midiFiles: Map<number, MidiFile>;
    private users: Map<string, User>;
    private userDownloads: Map<number, UserDownload>;
    private anonymousUsage: Map<string, AnonymousUsage>;
    private gdprConsents: Map<number, GdprConsent>;
    private currentMidiFileId: number;
    private currentDownloadId: number;
    private currentAnonymousId: number;
    private currentGdprConsentId: number;
    
    constructor() {
        this.midiFiles = new Map();
        this.users = new Map();
        this.userDownloads = new Map();
        this.anonymousUsage = new Map();
        this.gdprConsents = new Map();
        this.currentMidiFileId = 1;
        this.currentDownloadId = 1;
        this.currentAnonymousId = 1;
        this.currentGdprConsentId = 1;
    }
    
    async recordDailyUsage(_userId: string, _verseCount: number): Promise<void> {
        // Daily usage is tracked via userDownloads in memory
        return Promise.resolve();
    }
    
    async createMidiFile(insertMidiFile: InsertMidiFile): Promise<MidiFile> {
        const id = this.currentMidiFileId++;
        const midiFile: MidiFile = {
            id,
            filename:     insertMidiFile.filename,
            friendlyName: insertMidiFile.friendlyName || `Request ${id}`,
            instrument:   insertMidiFile.instrument,
            tempo:        insertMidiFile.tempo || 120,
            mode:         insertMidiFile.mode || "dorian",
            verseCount:   insertMidiFile.verseCount || 0,
            verses:       insertMidiFile.verses || [],
            createdAt:    new Date(),
        };
        this.midiFiles.set(id,
                           midiFile);
        return midiFile;
    }
    
    async getMidiFile(id: number): Promise<MidiFile | undefined> {
        return this.midiFiles.get(id);
    }
    
    async getMidiFileByFilename(filename: string): Promise<MidiFile | undefined> {
        const values = Array.from(this.midiFiles.values());
        return values.find((file) => file.filename === filename);
    }
    
    async getUserMidiFiles(userId: string): Promise<MidiFile[]> {
        return Array.from(this.midiFiles.values()).filter((file) =>
                                                              file.filename.startsWith(`user_${userId}_`),
        );
    }
    
    async deleteMidiFile(id: number): Promise<void> {
        const midiFile = this.midiFiles.get(id);
        if (midiFile) {
            try {
                const fs = await import('fs');
                const path = await import('path');
                const filepath = path.join(process.cwd(),
                                           'downloads',
                                           'midi',
                                           midiFile.filename);
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
                const scorePath = path.join(process.cwd(),
                                            'downloads',
                                            'scores',
                                            midiFile.filename.replace(/\.mid$/i,
                                                                      '.musicxml'));
                if (fs.existsSync(scorePath)) fs.unlinkSync(scorePath);
            }
            catch (error) {
                console.error('Error deleting physical file:',
                              error);
                throw error;
            }
        }
        this.midiFiles.delete(id);
    }
    
    async getUser(id: string): Promise<User | undefined> {
        return this.users.get(id);
    }
    
    async upsertUser(userData: UpsertUser): Promise<User> {
        const userId = userData.id!;
        const existing = this.users.get(userId);
        
        if (existing) {
            const updated: User = {
                ...existing,
                // Google remains authoritative for account identity/contact
                // metadata, but never overwrites a locally rectified name.
                email:           userData.email || existing.email,
                profileImageUrl: userData.profileImageUrl || existing.profileImageUrl,
                id:              userId,
                updatedAt:       new Date(),
            };
            this.users.set(userId,
                           updated);
            return updated;
        } else {
            const user: User = {
                id:              userId,
                email:           userData.email || null,
                firstName:       userData.firstName || null,
                lastName:        userData.lastName || null,
                profileImageUrl: userData.profileImageUrl || null,
                dailyVerseLimit: 100,
                createdAt:       new Date(),
                updatedAt:       new Date(),
            };
            this.users.set(userId,
                           user);
            return user;
        }
    }
    
    async recordDownload(download: InsertUserDownload): Promise<UserDownload> {
        const id = this.currentDownloadId++;
        const userDownload: UserDownload = {
            id,
            userId:       download.userId,
            midiFileId:   download.midiFileId,
            filename:     download.filename,
            friendlyName: download.friendlyName || null,
            downloadedAt: new Date(),
        };
        this.userDownloads.set(id,
                               userDownload);
        return userDownload;
    }
    
    async getUserDownloads(userId: string, limit?: number): Promise<UserDownload[]> {
        const values = Array.from(this.userDownloads.values());
        const downloads = values
        .filter(download => download.userId === userId)
        .sort((a, b) => {
            const dateA = a.downloadedAt || new Date(0);
            const dateB = b.downloadedAt || new Date(0);
            return dateB.getTime() - dateA.getTime() || b.id - a.id;
        })
        .slice(0,
               limit);
        
        const enrichedDownloads = [];
        for (const download of downloads) {
            const midiFile = await this.getMidiFile(download.midiFileId);
            const enriched = {
                ...download,
                friendlyName: midiFile?.friendlyName || download.friendlyName || `Request ${download.midiFileId}`,
            };
            enrichedDownloads.push(enriched);
        }
        
        return enrichedDownloads;
    }
    
    async getAnonymousUsage(ipAddress: string): Promise<AnonymousUsage | undefined> {
        return this.anonymousUsage.get(ipAddress);
    }
    
    async recordAnonymousUsage(usage: InsertAnonymousUsage): Promise<AnonymousUsage> {
        const anonymousRecord: AnonymousUsage = {
            id:         this.currentAnonymousId++,
            ipHash:     usage.ipHash,
            verseCount: usage.verseCount || 0,
            lastUsed:   usage.lastUsed || new Date(),
            createdAt:  new Date(),
        };
        this.anonymousUsage.set(usage.ipHash,
                                anonymousRecord);
        return anonymousRecord;
    }
    
    async updateAnonymousUsage(ipAddress: string, verseCount: number): Promise<void> {
        const existing = this.anonymousUsage.get(ipAddress);
        if (existing) {
            existing.verseCount = (
                                      existing.verseCount || 0
                                  ) + verseCount;
            existing.lastUsed = new Date();
        } else {
            await this.recordAnonymousUsage({
                                                ipHash:     ipAddress,
                                                verseCount: verseCount,
                                                lastUsed:   new Date(),
                                            });
        }
    }
    
    async getUserDailyVerseCount(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0,
                       0,
                       0,
                       0);
        
        const values = Array.from(this.userDownloads.values());
        const downloads = values.filter(download => {
            const dlDate = download.downloadedAt;
            return download.userId === userId && dlDate && dlDate >= today;
        });
        
        let total = 0;
        for (const download of downloads) {
            const midiFile = this.midiFiles.get(download.midiFileId);
            total += midiFile?.verseCount || 1;
        }
        return total;
    }
    
    async getUserDailyLimit(userId: string): Promise<number> {
        const user = await this.getUser(userId);
        return user?.dailyVerseLimit || 100;
    }
    
    async setUserDailyLimit(userId: string, limit: number): Promise<void> {
        const user = this.users.get(userId);
        if (user) {
            user.dailyVerseLimit = limit;
            user.updatedAt = new Date();
        }
    }
    
    async checkUserIsUnlimited(email: string): Promise<boolean> {
        return email === process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE;
    }
    
    async deleteUser(id: string): Promise<void> {
        this.users.delete(id);
        const keysToDelete: number[] = [];
        const entries = Array.from(this.userDownloads.entries());
        for (const [key, download] of entries) {
            if (download.userId === id) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.userDownloads.delete(key);
        }
    }
    
    async updateUserData(id: string, data: { name?: string; firstName?: string; lastName?: string }): Promise<void> {
        const user = this.users.get(id);
        if (user && (
            data.name || data.firstName || data.lastName
        )) {
            if (data.name) user.firstName = data.name;
            if (data.firstName) user.firstName = data.firstName;
            if (data.lastName) user.lastName = data.lastName;
            user.updatedAt = new Date();
            this.users.set(id,
                           user);
        }
    }
    
    async recordGdprConsent(userId: string): Promise<GdprConsent> {
        const consent: GdprConsent = {
            id:          this.currentGdprConsentId++,
            userId:      userId,
            consentDate: new Date(),
            createdAt:   new Date(),
        };
        this.gdprConsents.set(consent.id,
                              consent);
        return consent;
    }
    
    async getLatestGdprConsent(userId: string): Promise<GdprConsent | undefined> {
        let latestConsent: GdprConsent | undefined;
        let latestDate = new Date(0);
        
        const consentArray = Array.from(this.gdprConsents.values());
        for (const consent of consentArray) {
            if (consent.userId === userId && (
                consent.consentDate > latestDate ||
                (consent.consentDate.getTime() === latestDate.getTime() && consent.id > (latestConsent?.id || 0))
            )) {
                latestConsent = consent;
                latestDate = consent.consentDate;
            }
        }
        
        return latestConsent;
    }
}

export class DatabaseStorage implements IStorage {
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id,
                                                              id));
        return user || undefined;
    }
    
    async upsertUser(userData: UpsertUser): Promise<User> {
        const [user] = await db
        .insert(users)
        .values({
                    id:              userData.id,
                    email:           userData.email,
                    firstName:       userData.firstName,
                    lastName:        userData.lastName,
                    profileImageUrl: userData.profileImageUrl,
                    dailyVerseLimit: 100,
                })
        .onConflictDoUpdate({
                                target: users.id,
                                set:    {
                                    email:           userData.email,
                                    profileImageUrl: userData.profileImageUrl,
                                    updatedAt:       new Date(),
                                },
                            })
        .returning();
        return user;
    }
    
    async recordGdprConsent(userId: string): Promise<GdprConsent> {
        const [consent] = await db
        .insert(gdprConsents)
        .values({
                    userId:      userId,
                    consentDate: new Date(),
                })
        .returning();
        return consent;
    }
    
    async getLatestGdprConsent(userId: string): Promise<GdprConsent | undefined> {
        const [consent] = await db
        .select()
        .from(gdprConsents)
        .where(eq(gdprConsents.userId,
                  userId))
        .orderBy(desc(gdprConsents.consentDate),
                 desc(gdprConsents.id))
        .limit(1);
        return consent;
    }
    
    async deleteUser(id: string): Promise<void> {
        // Sessions do not have a foreign key to users. Remove every active
        // session for this account before deleting the user record itself.
        await db.execute(sql`DELETE
                             FROM sessions
                             WHERE sess -> 'passport' ->> 'user' = ${id}`);
        await db.delete(users).where(eq(users.id,
                                        id));
    }
    
    async updateUserData(id: string, data: { name?: string; firstName?: string; lastName?: string }): Promise<void> {
        if (data.name || data.firstName || data.lastName) {
            await db.update(users)
                    .set({
                             ...(
                                 data.name || data.firstName ? { firstName: data.name || data.firstName } : {}
                             ),
                             ...(
                                 data.lastName ? { lastName: data.lastName } : {}
                             ),
                             updatedAt: new Date(),
                         })
                    .where(eq(users.id,
                              id));
        }
    }
    
    async createMidiFile(insertMidiFile: InsertMidiFile): Promise<MidiFile> {
        try {
            const values: any = {
                filename:     insertMidiFile.filename,
                friendlyName: insertMidiFile.friendlyName || null,
                instrument:   insertMidiFile.instrument,
                tempo:        insertMidiFile.tempo || 120,
                mode:         insertMidiFile.mode || "dorian",
                verseCount:   insertMidiFile.verseCount || 0,
                verses:       insertMidiFile.verses || [],
                createdAt:    new Date(),
            };
            
            const [midiFile] = await db
            .insert(midiFiles)
            .values(values)
            .returning();
            return midiFile;
        }
        catch (error) {
            console.error('Error creating MIDI file:',
                          error);
            throw error;
        }
    }
    
    async getMidiFile(id: number): Promise<MidiFile | undefined> {
        try {
            const [midiFile] = await db.select().from(midiFiles).where(eq(midiFiles.id,
                                                                          id));
            return midiFile || undefined;
        }
        catch (error) {
            console.error('Error getting MIDI file:',
                          error);
            return undefined;
        }
    }
    
    async getMidiFileByFilename(filename: string): Promise<MidiFile | undefined> {
        try {
            const [midiFile] = await db.select().from(midiFiles).where(eq(midiFiles.filename,
                                                                          filename));
            return midiFile || undefined;
        }
        catch (error) {
            console.error('Error getting MIDI file by filename:',
                          error);
            return undefined;
        }
    }
    
    async getUserMidiFiles(userId: string): Promise<MidiFile[]> {
        return await db.select()
                       .from(midiFiles)
                       .where(like(midiFiles.filename,
                                   `user_${userId}_%`));
    }
    
    async deleteMidiFile(id: number): Promise<void> {
        try {
            const [midiFile] = await db.select().from(midiFiles).where(eq(midiFiles.id,
                                                                          id));
            
            const fs = await import('fs');
            const path = await import('path');
            if (midiFile) {
                const filepath = path.join(process.cwd(),
                                           'downloads',
                                           'midi',
                                           midiFile.filename);
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
                const scorePath = path.join(process.cwd(),
                                            'downloads',
                                            'scores',
                                            midiFile.filename.replace(/\.mid$/i,
                                                                      '.musicxml'));
                if (fs.existsSync(scorePath)) fs.unlinkSync(scorePath);
            }
            
            await db.delete(userDownloads).where(eq(userDownloads.midiFileId,
                                                    id));
            await db.delete(midiFiles).where(eq(midiFiles.id,
                                                id));
        }
        catch (error) {
            console.error('Error deleting MIDI file:',
                          error);
            throw error;
        }
    }
    
    async recordDownload(download: InsertUserDownload): Promise<UserDownload> {
        try {
            const [userDownload] = await db
            .insert(userDownloads)
            .values({
                        userId:       download.userId,
                        midiFileId:   download.midiFileId,
                        filename:     download.filename,
                        friendlyName: download.friendlyName || null,
                        downloadedAt: new Date(),
                    })
            .returning();
            return userDownload;
        }
        catch (error) {
            console.error('Error recording download:',
                          error);
            throw error;
        }
    }
    
    async getUserDownloads(userId: string, limit?: number): Promise<UserDownload[]> {
        try {
            const query = db.select().from(userDownloads).where(eq(userDownloads.userId,
                                                                   userId)).orderBy(desc(userDownloads.downloadedAt),
                                                                                     desc(userDownloads.id));
            if (limit) {
                return await query.limit(limit);
            }
            return await query;
        }
        catch (error) {
            console.error('Error getting user downloads:',
                          error);
            return [];
        }
    }
    
    async getAnonymousUsage(ipAddress: string): Promise<AnonymousUsage | undefined> {
        return memStorage.getAnonymousUsage(ipAddress);
    }
    
    async recordAnonymousUsage(usage: InsertAnonymousUsage): Promise<AnonymousUsage> {
        return memStorage.recordAnonymousUsage(usage);
    }
    
    async updateAnonymousUsage(ipAddress: string, verseCount: number): Promise<void> {
        return memStorage.updateAnonymousUsage(ipAddress,
                                               verseCount);
    }
    
    async checkUserIsUnlimited(email: string): Promise<boolean> {
        const unlimitedEmails = [process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE];
        return unlimitedEmails.includes(email);
    }
    
    async getUserDailyVerseCount(userId: string): Promise<number> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [usage] = await db.select().from(dailyUsage).where(
                and(eq(dailyUsage.userId,
                       userId),
                    eq(dailyUsage.date,
                       today)),
            );
            return usage?.verseCount || 0;
        }
        catch (error) {
            console.error('Error getting daily verse count:',
                          error);
            return 0;
        }
    }
    
    async getUserDailyLimit(userId: string): Promise<number> {
        try {
            const [user] = await db.select().from(users).where(eq(users.id,
                                                                  userId));
            return user?.dailyVerseLimit || 100;
        }
        catch (error) {
            console.error('Error getting daily limit:',
                          error);
            return 100;
        }
    }
    
    async recordDailyUsage(userId: string, verseCount: number): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            await db.insert(dailyUsage)
                    .values({
                                userId,
                                date: today,
                                verseCount,
                            })
                    .onConflictDoUpdate({
                                            target: [dailyUsage.userId, dailyUsage.date],
                                            set:    {
                                                verseCount: sql`daily_usage.verse_count +
                                                ${verseCount}`,
                                                updatedAt:  new Date(),
                                            },
                                        });
        }
        catch (error) {
            console.error('Error recording daily usage:',
                          error);
        }
    }
}

const memStorage = new MemStorage();
export const storage: IStorage = process.env.DATABASE_URL ? new DatabaseStorage() : memStorage;
