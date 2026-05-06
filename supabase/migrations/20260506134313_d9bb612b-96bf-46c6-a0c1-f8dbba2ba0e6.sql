-- Placeholder migration to trigger type generation
CREATE TABLE IF NOT EXISTS _lovable_sync (id uuid primary key default gen_random_uuid());
DROP TABLE _lovable_sync;