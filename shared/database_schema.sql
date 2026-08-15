--
-- PostgreSQL database schema for Ancient Greek MIDI Composer
-- Generated: June 30, 2025.
-- Compatible with: PostgreSQL 16.x
--

-- Extensions (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS daily_usage CASCADE;
DROP TABLE IF EXISTS gdpr_consents CASCADE;
DROP TABLE IF EXISTS user_downloads CASCADE;
DROP TABLE IF EXISTS anonymous_usage CASCADE;
DROP TABLE IF EXISTS midi_files CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id character varying NOT NULL PRIMARY KEY,
    email character varying UNIQUE,
    first_name character varying,
    last_name character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    profile_image_url character varying,
    daily_verse_limit integer DEFAULT 10000000
);

-- Sessions table for session management (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid character varying NOT NULL PRIMARY KEY,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);

-- Index for session expiration cleanup
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- MIDI files table for storing generated compositions
CREATE TABLE IF NOT EXISTS midi_files (
    id serial PRIMARY KEY,
    filename text NOT NULL,
    friendly_name text NOT NULL,
    verses json NOT NULL,
    instrument text NOT NULL,
    tempo integer DEFAULT 120,
    mode text DEFAULT 'dorian',
    verse_count integer,
    created_at timestamp without time zone DEFAULT now()
);

-- User downloads table for tracking download history
CREATE TABLE IF NOT EXISTS user_downloads (
    id serial PRIMARY KEY,
    user_id character varying NOT NULL,
    midi_file_id integer NOT NULL,
    filename text NOT NULL,
    friendly_name text,
    downloaded_at timestamp without time zone DEFAULT now()
);

-- Anonymous usage tracking for guest users
CREATE TABLE IF NOT EXISTS anonymous_usage (
    id serial PRIMARY KEY,
    ip_hash character varying(64) NOT NULL UNIQUE,
    verse_count integer DEFAULT 0,
    last_used timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);

-- GDPR consent tracking
CREATE TABLE IF NOT EXISTS gdpr_consents (
    id serial PRIMARY KEY,
    user_id character varying NOT NULL,
    consent_date timestamp without time zone NOT NULL DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);

-- Daily usage tracking for authenticated users
CREATE TABLE IF NOT EXISTS daily_usage (
    id serial PRIMARY KEY,
    user_id character varying NOT NULL,
    date character varying NOT NULL,
    verse_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Foreign key constraints
ALTER TABLE gdpr_consents 
    ADD CONSTRAINT gdpr_consents_user_id_users_id_fk 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE daily_usage 
    ADD CONSTRAINT daily_usage_user_id_users_id_fk 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_downloads 
    ADD CONSTRAINT user_downloads_user_id_users_id_fk 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_downloads 
    ADD CONSTRAINT user_downloads_midi_file_id_midi_files_id_fk 
    FOREIGN KEY (midi_file_id) REFERENCES midi_files(id) ON DELETE CASCADE;

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_downloaded_at ON user_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_midi_files_created_at ON midi_files(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_ip_hash ON anonymous_usage(ip_hash);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_user_id ON gdpr_consents(user_id);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication and settings';
COMMENT ON TABLE sessions IS 'Session storage for user authentication (required)';
COMMENT ON TABLE midi_files IS 'Generated MIDI compositions with metadata';
COMMENT ON TABLE user_downloads IS 'Download history for authenticated users';
COMMENT ON TABLE anonymous_usage IS 'Usage tracking for guest users by IP hash';
COMMENT ON TABLE gdpr_consents IS 'GDPR consent records for compliance';
COMMENT ON TABLE daily_usage IS 'Daily verse usage tracking independent of download history';

COMMENT ON COLUMN midi_files.verses IS 'JSON array of verse data (stored as empty for privacy)';
COMMENT ON COLUMN users.daily_verse_limit IS 'Daily verse generation limit (10M = unlimited)';
COMMENT ON COLUMN anonymous_usage.ip_hash IS 'SHA-256 hash of IP address for privacy';
COMMENT ON COLUMN daily_usage.date IS 'Date in YYYY-MM-DD format for usage tracking';