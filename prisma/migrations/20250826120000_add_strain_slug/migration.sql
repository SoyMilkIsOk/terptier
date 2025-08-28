ALTER TABLE "Strain" ADD COLUMN "strainSlug" TEXT NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX "Strain_strainSlug_key" ON "Strain"("strainSlug");
