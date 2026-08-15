// noinspection JSUnusedGlobalSymbols

import {index, integer, json, jsonb, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import {createInsertSchema}                                                     from "drizzle-zod";
import {z}                                                                      from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for session management, don't drop it.
export const sessions = pgTable(
    "sessions",
    {
        sid:    varchar("sid").primaryKey(),
        sess:   jsonb("sess").notNull(),
        expire: timestamp("expire").notNull(),
    },
    (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// Users table already defined above

// Verse table removed - we don't store verse texts for privacy

export const midiFiles = pgTable("midi_files",
                                 {
                                     id:           serial("id").primaryKey(),
                                     filename:     text("filename").notNull(),
                                     friendlyName: text("friendly_name").notNull(),
                                     verses:       json("verses").notNull(),
                                     instrument:   text("instrument").notNull(),
                                     tempo:        integer("tempo").default(120),
                                     mode:         text("mode").default("dorian"),
                                     verseCount:   integer("verse_count"),
                                     createdAt:    timestamp("created_at").defaultNow(),
                                 });

export const userDownloads = pgTable("user_downloads",
                                     {
                                         id:           serial("id").primaryKey(),
                                         userId:       varchar("user_id").notNull(),
                                         midiFileId:   integer("midi_file_id").notNull(),
                                         filename:     text("filename").notNull(),
                                         friendlyName: text("friendly_name"),
                                         downloadedAt: timestamp("downloaded_at").defaultNow(),
                                     });

export const anonymousUsage = pgTable("anonymous_usage",
                                      {
                                          id:         serial("id").primaryKey(),
                                          ipHash:     varchar("ip_hash",
                                                              { length: 64 }).notNull().unique(),
                                          verseCount: integer("verse_count").default(0),
                                          lastUsed:   timestamp("last_used").defaultNow(),
                                          createdAt:  timestamp("created_at").defaultNow(),
                                      });

// Users table for authentication
export const users = pgTable("users",
                             {
                                 id:              varchar("id").primaryKey().notNull(),
                                 email:           varchar("email").unique(),
                                 firstName:       varchar("first_name"),
                                 lastName:        varchar("last_name"),
                                 createdAt:       timestamp("created_at").defaultNow(),
                                 updatedAt:       timestamp("updated_at").defaultNow(),
                                 profileImageUrl: varchar("profile_image_url"),
                                 dailyVerseLimit: integer("daily_verse_limit").default(10000000),
                             });

export const gdprConsents = pgTable("gdpr_consents",
                                    {
                                        id:          serial("id").primaryKey(),
                                        userId:      varchar("user_id").notNull().references(() => users.id,
                                                                                             { onDelete: 'cascade' }),
                                        consentDate: timestamp("consent_date").notNull().defaultNow(),
                                        createdAt:   timestamp("created_at").defaultNow(),
                                    });

// Daily usage tracking (separate from download history for data integrity)
export const dailyUsage = pgTable("daily_usage",
                                  {
                                      id:         serial("id").primaryKey(),
                                      userId:     varchar("user_id").notNull(),
                                      date:       varchar("date").notNull(), // YYYY-MM-DD format
                                      verseCount: integer("verse_count").default(0),
                                      createdAt:  timestamp("created_at").defaultNow(),
                                      updatedAt:  timestamp("updated_at").defaultNow(),
                                  });

export const verseSchema = z.object({
                                        text:               z.string().min(1,
                                                                           "Verse text is required"),
                                        metrics:            z.string().min(1,
                                                                           "Metrical pattern is required"),
                                        arsisThesisPattern: z.string().optional(), // "A-T-T-A-T-A-T" format
                                    });

export const experimentalOptionsSchema = z.object({
                                                      rhythmModel:             z.enum([
                                                                                          "standard",
                                                                                          "chronos_ratios",
                                                                                          "heraclitean_pulse",
                                                                                          "euripidean_flow",
                                                                                          "delphic_paean",
                                                                                          "sapphic_lyric",
                                                                                          "nomos_apollonian",
                                                                                          "antiochene_scenic",
                                                                                      ]).optional(),
                                                      // Ptolemy, Harmonics II.10–11 (Solomon, pp.88–92)
                                                      // documents these seven tonoi as transposition positions.
                                                      // The source-checked Ptolemaic framework is the default;
                                                      // interpretive ethos remains an explicit alternative.
                                                      tonos:                   z.enum(["none", "dorian", "phrygian", "lydian", "mixolydian", "hypolydian", "hypophrygian", "hypodorian"]).default("dorian"),
                                                      genus:                   z.enum(["diatonic", "diatonic_soft", "chromatic", "chromatic_soft", "chromatic_hemiolic", "enharmonic", "enharmonic_symmetric"]).default("diatonic"),
                                                      baseUnit:                z.number().min(100).max(1000).default(250),
                                                      tuningSystem:            z.enum(["equal_temperament", "pythagorean"]).default("equal_temperament"),
                                                      ethosMapping:            z.boolean().default(false),
                                                      noAccentFallback:        z.boolean().optional(),
                                                      antiocheneFeatures:      z.object({
                                                                                            rhythmicCells:           z.enum(["standard", "dochmiac_paeon_cretic", "paeon_cretic_iamb", "tragic_meters", "comic_meters"]).default("standard"),
                                                                                            melismaticOrnamentation: z.boolean().default(false),
                                                                                            antiphonalResponse:      z.boolean().default(false),
                                                                                            pantomimeLayer:          z.boolean().default(false),
                                                                                        }).optional(),
                                                  });

export const midiGenerationSchema = z.object({
                                                 verses:             z.array(verseSchema).min(1,
                                                                                              "At least one verse is required"),
                                                 friendlyName:       z.string().min(1).optional(),
                                                 instrument:         z.enum([
                                                                                "aulos", "syrinx", "lyra", "kithara", "phorminx", "pandura",
                                                                                "tympanon", "salpinx", "krotala", "kymbala", "sistrum",
                                                                                "rhoptron", "keraunoskopion", "hand_clap_light", "hand_clap_strong",
                                                                            ],
                                                                            {
                                                                                errorMap: () => (
                                                                                    { message: "Please select a valid ancient Greek instrument" }
                                                                                ),
                                                                            }),
                                                 tempo:              z.number().min(60).max(200).default(120),
                                                 mode:               z.enum(["dorian", "phrygian", "lydian", "mixolydian", "aeolian", "hypolydian", "hypophrygian", "hypodorian"]).default("dorian"),
                                                 includeMetronome:   z.boolean().optional().default(false),
                                                 includeAccentTrack: z.boolean().optional().default(false),
                                                 includeVocalGuide:  z.boolean().optional().default(false),
                                                 outputFormat:       z.enum(["midi", "wav"]).optional().default("midi"),
                                                 allowMelody:        z.boolean().optional().default(false),
                                                 experimental:       experimentalOptionsSchema.optional(),
                                             });

// Verse schemas removed - we don't store verse texts

export const insertMidiFileSchema = createInsertSchema(midiFiles).omit({
                                                                           id:        true,
                                                                           createdAt: true,
                                                                       });

export const insertUserDownloadSchema = createInsertSchema(userDownloads).omit({
                                                                                   id:           true,
                                                                                   downloadedAt: true,
                                                                               });

export const insertAnonymousUsageSchema = createInsertSchema(anonymousUsage).omit({
                                                                                      id:        true,
                                                                                      createdAt: true,
                                                                                  });

export const insertGdprConsentSchema = createInsertSchema(gdprConsents).omit({
                                                                                 id:        true,
                                                                                 createdAt: true,
                                                                             });

export const insertDailyUsageSchema = createInsertSchema(dailyUsage).omit({
                                                                              id:        true,
                                                                              createdAt: true,
                                                                              updatedAt: true,
                                                                          });

// Verse types removed - we don't store verse texts
export type MidiFile              = typeof midiFiles.$inferSelect;
export type InsertMidiFile        = z.infer<typeof insertMidiFileSchema>;
export type MidiGenerationRequest = z.infer<typeof midiGenerationSchema>;
export type UserDownload          = typeof userDownloads.$inferSelect;
export type InsertUserDownload    = z.infer<typeof insertUserDownloadSchema>;
export type User                  = typeof users.$inferSelect;
export type UpsertUser            = typeof users.$inferInsert;
export type SelectUser            = typeof users.$inferSelect;
export type GdprConsent           = typeof gdprConsents.$inferSelect;
export type InsertGdprConsent     = z.infer<typeof insertGdprConsentSchema>;
export type AnonymousUsage        = typeof anonymousUsage.$inferSelect;
export type InsertAnonymousUsage  = z.infer<typeof insertAnonymousUsageSchema>;
export type DailyUsage            = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage      = z.infer<typeof insertDailyUsageSchema>;
