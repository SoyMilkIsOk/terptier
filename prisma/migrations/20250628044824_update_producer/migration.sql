/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Producer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Producer" ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Producer_slug_key" ON "Producer"("slug");
