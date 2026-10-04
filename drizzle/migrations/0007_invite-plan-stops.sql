ALTER TABLE "invites" ADD COLUMN "plan_title" text;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "plan_stops" jsonb DEFAULT '[]'::jsonb NOT NULL;