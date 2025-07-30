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
    const existing = await prisma.notificationPreference.findFirst({
      where: { userId: session.user.id },
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
          userId: session.user.id,
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
