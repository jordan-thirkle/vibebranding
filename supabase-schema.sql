-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bso JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for listing user's brands
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_updated_at ON brands(updated_at DESC);

-- Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Users can only see their own brands
CREATE POLICY "Users can view own brands" 
  ON brands FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own brands
CREATE POLICY "Users can insert own brands" 
  ON brands FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brands
CREATE POLICY "Users can update own brands" 
  ON brands FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own brands
CREATE POLICY "Users can delete own brands" 
  ON brands FOR DELETE 
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
