-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STATE_ADMIN';

-- CreateTable
CREATE TABLE "StateAdmin" (
    "userId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "StateAdmin_pkey" PRIMARY KEY ("userId", "stateId")
);

-- AddForeignKey
ALTER TABLE "StateAdmin" ADD CONSTRAINT "StateAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StateAdmin" ADD CONSTRAINT "StateAdmin_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
