/*
  # Create memories table for saving important moments

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text) - user's title for this memory
      - `description` (text) - why this moment is important
      - `feelings` (text array) - emotions associated with this moment
      - `special_dates` (date array) - important dates to remember
      - `conversation_ids` (uuid array) - IDs of conversations included
      - `backed_up_at` (timestamptz) - last backup timestamp
      - `created_at` (timestamptz) - when memory was saved
      - `updated_at` (timestamptz) - when memory was last updated

  2. Security
    - Enable RLS on `memories` table
    - Add policy for users to view own memories
    - Add policy for users to create/update/delete own memories
    - Add policy for backup service to access memories

  3. Indexes
    - Index on (user_id, created_at) for efficient querying
    - Index on backed_up_at for backup tracking
*/

CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  feelings text[] DEFAULT '{}',
  special_dates date[] DEFAULT '{}',
  conversation_ids uuid[] DEFAULT '{}',
  backed_up_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_memories_user_created ON memories(user_id, created_at DESC);
CREATE INDEX idx_memories_backed_up ON memories(backed_up_at);