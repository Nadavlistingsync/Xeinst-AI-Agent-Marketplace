-- First, create a temporary table with the correct structure
CREATE TABLE "products_new" (
  LIKE "products" INCLUDING ALL
);

-- Modify the new table to have the correct column types
ALTER TABLE "products_new" 
  ALTER COLUMN "features" TYPE jsonb USING '[]'::jsonb,
  ALTER COLUMN "requirements" TYPE jsonb USING '[]'::jsonb;

-- Copy data from old table to new table
INSERT INTO "products_new" 
SELECT 
  *,
  COALESCE(features::jsonb, '[]'::jsonb) as features,
  COALESCE(requirements::jsonb, '[]'::jsonb) as requirements
FROM "products";

-- Drop the old table
DROP TABLE "products";

-- Rename the new table to the original name
ALTER TABLE "products_new" RENAME TO "products";

-- Recreate all constraints and indexes
ALTER TABLE "products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE ("slug");
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
ALTER TABLE "products" ADD CONSTRAINT "products_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id"); 