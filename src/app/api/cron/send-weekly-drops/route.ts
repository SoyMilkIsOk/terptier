import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { sendEmail } from "@/lib/email";

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
      await sendEmail(
        user.email,
        "Upcoming Drops",
        `${baseUrl}/drops`
      );
    } catch (err) {
      console.error("sendEmail failed", err);
    }
  }

  return NextResponse.json({ success: true, processed: users.length });
}

