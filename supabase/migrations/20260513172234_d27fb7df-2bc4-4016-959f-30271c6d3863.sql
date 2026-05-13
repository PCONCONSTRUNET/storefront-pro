CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Limpa jobs anteriores se existirem (idempotente)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT jobid, jobname FROM cron.job
    WHERE jobname IN ('cancel-expired-pix','abandoned-cart-reminder','daily-admin-summary')
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'cancel-expired-pix',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://glezvjgtzplflzevclor.supabase.co/functions/v1/cancel-expired-pix',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZXp2amd0enBsZmx6ZXZjbG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDYyNjMsImV4cCI6MjA5MzYyMjI2M30._bbOrxbqoZfH9rRyyLDgudUfbCOAWqfZqwTUYWFjzsc"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'abandoned-cart-reminder',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://glezvjgtzplflzevclor.supabase.co/functions/v1/abandoned-cart-reminder',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZXp2amd0enBsZmx6ZXZjbG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDYyNjMsImV4cCI6MjA5MzYyMjI2M30._bbOrxbqoZfH9rRyyLDgudUfbCOAWqfZqwTUYWFjzsc"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'daily-admin-summary',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url:='https://glezvjgtzplflzevclor.supabase.co/functions/v1/daily-admin-summary',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZXp2amd0enBsZmx6ZXZjbG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDYyNjMsImV4cCI6MjA5MzYyMjI2M30._bbOrxbqoZfH9rRyyLDgudUfbCOAWqfZqwTUYWFjzsc"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);