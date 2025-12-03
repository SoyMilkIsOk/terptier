-- DropIndex
DROP INDEX "Strain_strainSlug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Strain_producerId_strainSlug_key" ON "Strain"("producerId", "strainSlug");
