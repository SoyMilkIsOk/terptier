import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { sendEmail } from "@/lib/email";
import { weeklyDropsEmail } from "@/lib/emailTemplates";

export async function GET() {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    console.error("BASE_URL env var missing");
    return NextResponse.json(
      { success: false, error: "Server misconfig" },
      { status: 500 }
    );
  }

  const users = await prisma.user.findMany({
    where: { notificationOptIn: true },
  });

  for (const user of users) {
    try {
      const profileSlug = user.username || user.id;
      const html = weeklyDropsEmail(baseUrl, profileSlug);
      const text = `Check out this week's drops: ${baseUrl}/drops\n\nManage preferences: ${baseUrl}/profile/${profileSlug}`;
      await sendEmail(user.email, "This Week's Drops", text, html);
    } catch (err) {
      console.error("sendEmail failed", err);
    }
  }

  return NextResponse.json({ success: true, processed: users.length });
}

