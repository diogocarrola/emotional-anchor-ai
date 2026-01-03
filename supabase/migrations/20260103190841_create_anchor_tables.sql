/*
  # Create Anchor conversation and user data tables

  1. New Tables
    - `conversations` - stores every message between user and Anchor
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, the actual message)
      - `sender` (text, 'user' or 'anchor')
      - `detected_mood` (text, emotion detected: sad, happy, anxious, neutral, grateful)
      - `created_at` (timestamp, when message was sent)
    
    - `emotional_summaries` - weekly/monthly emotional pattern tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `period` (text, 'weekly' or 'monthly')
      - `period_end` (date, end date of the summary period)
      - `dominant_mood` (text, most frequent emotion)
      - `mood_distribution` (jsonb, count of each mood detected)
      - `summary_text` (text, AI-generated insight about emotional patterns)
      - `created_at` (timestamp)
    
    - `user_profiles` - user preferences and backup settings
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `backup_enabled` (boolean, whether to auto-backup)
      - `backup_frequency` (text, 'daily' or 'weekly')
      - `last_backup_at` (timestamp, when last backup occurred)
      - `preferences` (jsonb, theme, notifications, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own conversations and summaries
    - Users can only update their own profile
    - Anchor service role can read all conversations for context generation

  3. Indexes
    - conversations: index on (user_id, created_at) for fast diary retrieval
    - emotional_summaries: index on (user_id, period_end)
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'anchor')),
  detected_mood text DEFAULT 'neutral',
  created_at timestamptz DEFAULT now()
);

-- Create emotional_summaries table
CREATE TABLE IF NOT EXISTS emotional_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly')),
  period_end date NOT NULL,
  dominant_mood text,
  mood_distribution jsonb DEFAULT '{}'::jsonb,
  summary_text text,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_enabled boolean DEFAULT false,
  backup_frequency text DEFAULT 'weekly' CHECK (backup_frequency IN ('daily', 'weekly')),
  last_backup_at timestamptz,
  preferences jsonb DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own emotional summaries
CREATE POLICY "Users can view own emotional summaries"
  ON emotional_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own emotional summaries
CREATE POLICY "Users can insert own emotional summaries"
  ON emotional_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_created 
  ON conversations(user_id, created_at DESC);

CREATE INDEX idx_emotional_summaries_user_period
  ON emotional_summaries(user_id, period_end DESC);

CREATE INDEX idx_user_profiles_backup
  ON user_profiles(backup_enabled, last_backup_at);
