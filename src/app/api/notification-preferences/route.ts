import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";

interface PreferenceBody {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
}

export async function GET() {
  const { session } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const pref = await prisma.notificationPreference.findFirst({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ success: true, preference: pref });
  } catch (err: any) {
    console.error("[GET /api/notification-preferences]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { session } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as PreferenceBody;

  try {
    const pref = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        email: body.email ?? true,
        sms: body.sms ?? false,
        push: body.push ?? false,
      },
      update: body,
    });
    return NextResponse.json({ success: true, preference: pref });
  } catch (err: any) {
    console.error("[PUT /api/notification-preferences]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
