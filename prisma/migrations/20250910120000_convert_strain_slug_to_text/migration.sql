-- Convert strainSlug from serial integer to text with random default
ALTER TABLE "Strain" ALTER COLUMN "strainSlug" DROP DEFAULT;
ALTER TABLE "Strain" ALTER COLUMN "strainSlug" TYPE TEXT USING "strainSlug"::TEXT;
DROP SEQUENCE IF EXISTS "Strain_strainSlug_seq";
UPDATE "Strain" SET "strainSlug" = gen_random_uuid();
ALTER TABLE "Strain" ALTER COLUMN "strainSlug" SET DEFAULT gen_random_uuid();
