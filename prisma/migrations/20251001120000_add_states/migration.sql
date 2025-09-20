-- Create State table
CREATE TABLE "State" (
    "id"   TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- Ensure codes and slugs are unique
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- Seed default Colorado state
INSERT INTO "State" ("id", "code", "name", "slug")
VALUES ('state_co_default', 'CO', 'Colorado', 'colorado')
ON CONFLICT ("code") DO NOTHING;

-- Producers gain a state reference
ALTER TABLE "Producer" ADD COLUMN "stateId" TEXT;

UPDATE "Producer"
SET "stateId" = (SELECT "id" FROM "State" WHERE "code" = 'CO')
WHERE "stateId" IS NULL;

ALTER TABLE "Producer"
ALTER COLUMN "stateId" SET NOT NULL;

ALTER TABLE "Producer"
ADD CONSTRAINT "Producer_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Refresh producer uniqueness constraints for state scoping
DROP INDEX IF EXISTS "Producer_name_category_key";
DROP INDEX IF EXISTS "Producer_slug_key";
CREATE UNIQUE INDEX "Producer_stateId_name_category_key" ON "Producer"("stateId", "name", "category");
CREATE UNIQUE INDEX "Producer_stateId_slug_key" ON "Producer"("stateId", "slug");
CREATE INDEX "Producer_stateId_idx" ON "Producer"("stateId");

-- Strains gain a state reference
ALTER TABLE "Strain" ADD COLUMN "stateId" TEXT;

UPDATE "Strain" s
SET "stateId" = p."stateId"
FROM "Producer" p
WHERE s."producerId" = p."id" AND s."stateId" IS NULL;

ALTER TABLE "Strain"
ALTER COLUMN "stateId" SET NOT NULL;

ALTER TABLE "Strain"
ADD CONSTRAINT "Strain_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Strain_stateId_idx" ON "Strain"("stateId");

-- Votes gain a state reference
ALTER TABLE "Vote" ADD COLUMN "stateId" TEXT;

UPDATE "Vote" v
SET "stateId" = p."stateId"
FROM "Producer" p
WHERE v."producerId" = p."id" AND v."stateId" IS NULL;

ALTER TABLE "Vote"
ALTER COLUMN "stateId" SET NOT NULL;

ALTER TABLE "Vote"
ADD CONSTRAINT "Vote_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Vote_stateId_idx" ON "Vote"("stateId");

-- Producer rating snapshots gain a state reference
ALTER TABLE "ProducerRatingSnapshot" ADD COLUMN "stateId" TEXT;

UPDATE "ProducerRatingSnapshot" prs
SET "stateId" = p."stateId"
FROM "Producer" p
WHERE prs."producerId" = p."id" AND prs."stateId" IS NULL;

ALTER TABLE "ProducerRatingSnapshot"
ALTER COLUMN "stateId" SET NOT NULL;

ALTER TABLE "ProducerRatingSnapshot"
ADD CONSTRAINT "ProducerRatingSnapshot_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ProducerRatingSnapshot_stateId_createdAt_idx" ON "ProducerRatingSnapshot"("stateId", "createdAt");
