-- ========================================
-- Supabase Setup for Study Hub
-- Run this in Supabase Dashboard > SQL Editor
-- ========================================

-- 1. Create the app_data table
CREATE TABLE IF NOT EXISTS app_data (
  id integer PRIMARY KEY DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Insert initial row
INSERT INTO app_data (id, payload) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read/write (no auth required)
CREATE POLICY "Allow public select" ON app_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON app_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON app_data FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON app_data FOR DELETE USING (true);

-- ========================================
-- Storage: Go to Dashboard > Storage
-- Click "Create bucket" > name: "studyhub" > public
-- ========================================
