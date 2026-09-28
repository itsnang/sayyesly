ALTER TABLE "invites" ADD COLUMN "song_start" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "song_length" integer DEFAULT 30 NOT NULL;