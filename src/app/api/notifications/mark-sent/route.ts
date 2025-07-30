import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";
import { sendEmail } from "@/lib/email";

interface MarkSentBody {
  jobId: string;
}

export async function POST(request: NextRequest) {
  const { session, claims } = await authorize();
  if (!session || claims?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { jobId } = (await request.json()) as MarkSentBody;
  if (!jobId) {
    return NextResponse.json({ success: false, error: "Missing jobId" }, { status: 400 });
  }

  try {
    const job = await prisma.notificationJob.findUnique({
      where: { id: jobId },
      include: { notification: { include: { user: true } } },
    });
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    await sendEmail(
      job.notification.user.email,
      "TerpTier Notification",
      job.notification.message
    );
    await prisma.notificationJob.update({
      where: { id: jobId },
      data: { sentAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/notifications/mark-sent]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
