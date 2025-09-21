-- CreateEnum
CREATE TYPE "Market" AS ENUM ('WHITE', 'BLACK', 'BOTH');

-- AlterTable
ALTER TABLE "Producer" ADD COLUMN "market" "Market" NOT NULL DEFAULT 'BOTH';
