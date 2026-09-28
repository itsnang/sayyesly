ALTER TABLE "users" ADD COLUMN "tester_since" timestamp with time zone;--> statement-breakpoint
-- The admin portal (itsnang/sayyesly-admin) makes a Creator a Tester, or stops
-- it: it may change this one column and nothing else about a Creator. It can
-- already read users. Skipped where the admin's restricted role doesn't exist
-- (e.g. a dev database).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'sayyesly_admin') THEN
    GRANT UPDATE (tester_since) ON public.users TO sayyesly_admin;
  END IF;
END
$$;
