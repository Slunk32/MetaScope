-- Enable UUID extension if needed (good practice)
create extension if not exists "uuid-ossp";

-- EVENTS TABLE
-- Stores metadata about events. Raw data serves as a backup.
create table events (
  id text primary key,          -- e.g. "modern-challenge-2026-01-30"
  name text not null,           -- "Modern Challenge 32"
  date timestamp not null,      -- 2026-01-30
  format text not null,         -- "Modern"
  type text,                    -- "Challenge", "League"
  raw_data jsonb,               -- Store full scraped JSON here (Safety net!)
  created_at timestamp default now()
);

-- DECKS TABLE
-- Stores individual decks linked to events.
create table decks (
  id text primary key,          -- e.g. "playername-rank"
  event_id text references events(id),
  player_name text,
  result text,                  -- "1st", "5-0"
  archetype text,               -- "Rhinos" (Computed by our rules)
  cards jsonb,                  -- { main: [...], side: [...] }
  created_at timestamp default now()
);

-- INDEXES
-- For fast filtering by format
create index idx_events_format on events(format);
create index idx_decks_archetype on decks(archetype);
