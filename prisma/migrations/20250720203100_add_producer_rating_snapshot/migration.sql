-- CreateTable
CREATE TABLE "ProducerRatingSnapshot" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "categoryRank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProducerRatingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProducerRatingSnapshot_producerId_createdAt_idx" ON "ProducerRatingSnapshot"("producerId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProducerRatingSnapshot" ADD CONSTRAINT "ProducerRatingSnapshot_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
