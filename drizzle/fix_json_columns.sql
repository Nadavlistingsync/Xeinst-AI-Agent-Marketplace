-- First, create temporary columns with the correct type
ALTER TABLE "products" ADD COLUMN "features_new" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "products" ADD COLUMN "requirements_new" jsonb DEFAULT '[]'::jsonb;

-- Copy data from old columns to new ones with type conversion
UPDATE "products" 
SET 
  features_new = CASE 
    WHEN features IS NULL THEN '[]'::jsonb 
    ELSE features::jsonb 
  END,
  requirements_new = CASE 
    WHEN requirements IS NULL THEN '[]'::jsonb 
    ELSE requirements::jsonb 
  END;

-- Drop old columns
ALTER TABLE "products" DROP COLUMN IF EXISTS "features";
ALTER TABLE "products" DROP COLUMN IF EXISTS "requirements";

-- Rename new columns to original names
ALTER TABLE "products" RENAME COLUMN "features_new" TO "features";
ALTER TABLE "products" RENAME COLUMN "requirements_new" TO "requirements"; 