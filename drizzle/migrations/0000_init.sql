CREATE TYPE "public"."answer" AS ENUM('yes', 'maybe_later');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'paid', 'expired', 'failed');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" bigint NOT NULL,
	"telegram_sub" text,
	"name" text NOT NULL,
	"username" text,
	"photo_url" text,
	"can_dm" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_telegram_sub_unique" UNIQUE("telegram_sub")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"link_code" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"theme_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"question" text NOT NULL,
	"message" text,
	"image_url" text,
	"plan_place" text,
	"plan_activity" text,
	"plan_map_url" text,
	"plan_dress_code" text,
	"plan_notes" text,
	"plan_photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timezone" text DEFAULT 'Asia/Phnom_Penh' NOT NULL,
	"allow_custom_time" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invites_slug_unique" UNIQUE("slug"),
	CONSTRAINT "invites_link_code_unique" UNIQUE("link_code")
);
--> statement-breakpoint
CREATE TABLE "invite_time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"answer" "answer" NOT NULL,
	"time_slot_id" uuid,
	"starts_at" timestamp with time zone,
	"note" text,
	"no_dodges" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responses_invite_id_unique" UNIQUE("invite_id")
);
--> statement-breakpoint
CREATE TABLE "linked_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"chat_id" bigint NOT NULL,
	"chat_title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "linked_groups_invite_chat_unique" UNIQUE("invite_id","chat_id")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"cutluy_payment_id" text,
	"qr_string" text,
	"checkout_url" text,
	"expires_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_cutluy_payment_id_unique" UNIQUE("cutluy_payment_id")
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_time_slots" ADD CONSTRAINT "invite_time_slots_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_time_slot_id_invite_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."invite_time_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linked_groups" ADD CONSTRAINT "linked_groups_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invites_creator_id_idx" ON "invites" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "invite_time_slots_invite_id_idx" ON "invite_time_slots" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "purchases_user_theme_idx" ON "purchases" USING btree ("user_id","theme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_one_paid_per_theme" ON "purchases" USING btree ("user_id","theme_id") WHERE "purchases"."status" = 'paid';