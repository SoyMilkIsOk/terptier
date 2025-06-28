import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { del } from "@vercel/blob";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function GET() {
  const supabase = createServerActionClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    id: user.id,
    role: user.role,
    username: user.username,
    profilePicUrl: user.profilePicUrl,
  });
}

export async function PATCH(request: Request) {
  const supabase = createServerActionClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
  }

  const { profilePicUrl } = await request.json();

  const existing = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profilePicUrl: true },
  });

  await prisma.user.update({
    where: { email: session.user.email },
    data: { profilePicUrl },
  });

  if (existing?.profilePicUrl && existing.profilePicUrl !== profilePicUrl) {
    try {
      await del(new URL(existing.profilePicUrl).pathname);
    } catch (err) {
      console.error("Failed to delete old profile blob", err);
    }
  }

  return NextResponse.json({ success: true });
}
