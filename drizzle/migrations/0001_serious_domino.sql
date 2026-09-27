CREATE TYPE "public"."time_of_day" AS ENUM('morning', 'lunch', 'afternoon', 'evening');--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "time_of_day" time_of_day DEFAULT 'evening' NOT NULL;