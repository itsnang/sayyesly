ALTER TABLE "themes" ADD COLUMN "regular_price_cents" integer;--> statement-breakpoint
-- Binder's row, so it's on offer once its code is deployed. (The seed adds it
-- too, but seeding production would also put back Themes hidden there.)
INSERT INTO "themes" ("id", "name", "price_cents", "is_active", "sort_order")
VALUES ('binder', 'Binder', 199, true, 3)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
-- The sale: every Paid theme is free for now, its usual price kept to show
-- crossed out. Ending it is putting `price_cents` back and clearing
-- `regular_price_cents`, from the admin portal; no deploy.
UPDATE "themes"
SET "regular_price_cents" = "price_cents", "price_cents" = 0
WHERE "price_cents" > 0;--> statement-breakpoint
-- The admin portal (itsnang/sayyesly-admin) already sets a Theme's price; it
-- may set the regular price too. Skipped where the admin's restricted role
-- doesn't exist (e.g. a dev database).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'sayyesly_admin') THEN
    GRANT UPDATE (regular_price_cents) ON public.themes TO sayyesly_admin;
  END IF;
END
$$;
