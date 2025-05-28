CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"data" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "is_featured" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "average_rating" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rating" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "full_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_account_id";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");