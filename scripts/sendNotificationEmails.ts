import { prisma } from "@/lib/prismadb";
import { sendEmail } from "@/lib/email";

export async function sendNotificationEmails() {
  const jobs = await prisma.notificationJob.findMany({
    where: {
      sentAt: null,
      scheduledAt: { lte: new Date() },
    },
    include: {
      notification: { include: { user: true } },
    },
  });

  for (const job of jobs) {
    const { notification } = job;
    const email = notification.user.email;
    if (email) {
      await sendEmail(email, "TerpTier Notification", notification.message);
    }
    await prisma.notificationJob.update({
      where: { id: job.id },
      data: { sentAt: new Date() },
    });
  }
}

if (require.main === module) {
  sendNotificationEmails()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
