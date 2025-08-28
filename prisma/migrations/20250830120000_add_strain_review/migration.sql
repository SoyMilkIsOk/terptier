-- CreateTable
CREATE TABLE "StrainReview" (
    "id" TEXT NOT NULL,
    "comment" TEXT,
    "flavor" INTEGER NOT NULL,
    "effect" INTEGER NOT NULL,
    "smoke" INTEGER NOT NULL,
    "aggregateRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "strainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrainReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StrainReview_userId_strainId_key" ON "StrainReview"("userId", "strainId");

-- AddForeignKey
ALTER TABLE "StrainReview" ADD CONSTRAINT "StrainReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StrainReview" ADD CONSTRAINT "StrainReview_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StrainReview" ADD CONSTRAINT "StrainReview_strainId_fkey" FOREIGN KEY ("strainId") REFERENCES "Strain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
