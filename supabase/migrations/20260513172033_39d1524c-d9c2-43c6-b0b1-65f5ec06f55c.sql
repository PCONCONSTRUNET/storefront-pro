ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS daily_summary_id text;