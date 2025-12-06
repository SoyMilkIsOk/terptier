import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { strainId } = await request.json();

    if (!strainId) {
      return NextResponse.json({ success: false, error: "Missing strainId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await prisma.strainNotification.create({
      data: {
        userId: user.id,
        strainId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: true }); // Already subscribed, treat as success
    }
    console.error("Error subscribing:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { strainId } = await request.json();

    if (!strainId) {
      return NextResponse.json({ success: false, error: "Missing strainId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await prisma.strainNotification.deleteMany({
      where: {
        userId: user.id,
        strainId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
