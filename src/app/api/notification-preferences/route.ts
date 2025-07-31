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
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const pref = await prisma.notificationPreference.findFirst({
      where: { userId: user.id },
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
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as PreferenceBody;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.notificationPreference.findFirst({
      where: { userId: user.id },
    });

    let pref;
    if (existing) {
      pref = await prisma.notificationPreference.update({
        where: { id: existing.id },
        data: body,
      });
    } else {
      pref = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          email: body.email ?? true,
          sms: body.sms ?? false,
          push: body.push ?? false,
        },
      });
    }

    return NextResponse.json({ success: true, preference: pref });
  } catch (err: any) {
    console.error("[PUT /api/notification-preferences]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
