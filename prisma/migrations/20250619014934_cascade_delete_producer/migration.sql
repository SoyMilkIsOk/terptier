-- Alter foreign key to cascade delete votes when a producer is removed
ALTER TABLE "Vote" DROP CONSTRAINT IF EXISTS "Vote_producerId_fkey";
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
