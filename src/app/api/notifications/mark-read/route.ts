import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";

interface MarkReadBody {
  notificationId: string;
}

export async function POST(request: NextRequest) {
  const { session } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { notificationId } = (await request.json()) as MarkReadBody;
  if (!notificationId) {
    return NextResponse.json({ success: false, error: "Missing notificationId" }, { status: 400 });
  }

  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/notifications/mark-read]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
