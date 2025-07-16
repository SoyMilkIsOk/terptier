-- AlterTable
ALTER TABLE "Producer" ADD COLUMN "attributes" TEXT[] DEFAULT ARRAY[]::TEXT[];
