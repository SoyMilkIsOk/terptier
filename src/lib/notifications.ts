import { prisma } from "@/lib/prismadb";
import { sendEmail } from "@/lib/email";

export async function sendDropNotification(strainId: string, newDate: Date) {
  try {
    const strain = await prisma.strain.findUnique({
      where: { id: strainId },
      include: {
        producer: true,
        notifications: {
          include: { user: true },
        },
      },
    });

    if (!strain) return;

    const formattedDate = newDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `Drop Update: ${strain.name} by ${strain.producer.name}`;
    const text = `Great news! The drop date for ${strain.name} by ${strain.producer.name} has been updated to ${formattedDate}. Mark your calendars!`;

    const emailPromises = strain.notifications.map((notification) => {
      if (!notification.user.email) return Promise.resolve();
      
      return sendEmail(
        notification.user.email,
        subject,
        text,
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534;">Drop Date Update! 🌿</h1>
          <p>The drop date for <strong>${strain.name}</strong> by <strong>${strain.producer.name}</strong> has been updated.</p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #15803d; font-weight: bold; font-size: 18px;">New Date: ${formattedDate}</p>
          </div>
          <p>Visit TerpTier to see more details.</p>
        </div>
        `
      ).catch((err) => {
        console.error(`Failed to send notification to ${notification.user.email}:`, err);
      });
    });

    await Promise.all(emailPromises);
    console.log(`Sent ${emailPromises.length} notifications for strain ${strainId}`);
  } catch (error) {
    console.error("Error sending drop notifications:", error);
  }
}
