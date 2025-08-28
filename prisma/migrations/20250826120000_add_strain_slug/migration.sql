-- Add strainSlug column to Strain
ALTER TABLE "Strain" ADD COLUMN "strainSlug" SERIAL;
CREATE UNIQUE INDEX "Strain_strainSlug_key" ON "Strain"("strainSlug");
