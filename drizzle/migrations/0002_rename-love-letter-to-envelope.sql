-- The Love Letter Theme is now Envelope (id "envelope"). The id is a primary
-- key that invites and purchases reference without ON UPDATE CASCADE, so move
-- them over: add the new row with the same price and availability, repoint
-- every reference, then drop the old row. Safe to run twice; a no-op where
-- there's no love-letter row (e.g. a fresh database seeded with "envelope").
INSERT INTO "themes" ("id", "name", "price_cents", "is_active", "sort_order", "created_at")
SELECT 'envelope', 'Envelope', "price_cents", "is_active", "sort_order", "created_at" FROM "themes" WHERE "id" = 'love-letter'
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
UPDATE "invites" SET "theme_id" = 'envelope' WHERE "theme_id" = 'love-letter';--> statement-breakpoint
UPDATE "purchases" SET "theme_id" = 'envelope' WHERE "theme_id" = 'love-letter';--> statement-breakpoint
DELETE FROM "themes" WHERE "id" = 'love-letter';
