-- AlterTable
ALTER TABLE "Strain" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "strainSlug" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StrainReview" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StrainNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrainNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrainNotification_strainId_idx" ON "StrainNotification"("strainId");

-- CreateIndex
CREATE UNIQUE INDEX "StrainNotification_userId_strainId_key" ON "StrainNotification"("userId", "strainId");

-- AddForeignKey
ALTER TABLE "StrainNotification" ADD CONSTRAINT "StrainNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrainNotification" ADD CONSTRAINT "StrainNotification_strainId_fkey" FOREIGN KEY ("strainId") REFERENCES "Strain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
