-- migration: add comments table

-- Run with: psql < migrations/2026-08-07_add_comments_table.sql

CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type text NOT NULL CHECK (resource_type IN ('article', 'product')),
  resource_slug text NOT NULL,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  body text NOT NULL,
  moderated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz
);

CREATE INDEX IF NOT EXISTS comments_resource_idx ON comments (resource_type, resource_slug, created_at DESC);
