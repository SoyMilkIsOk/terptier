-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationJob" DROP CONSTRAINT "NotificationJob_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationOptIn" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "NotificationJob";

-- DropTable
DROP TABLE "NotificationPreference";

