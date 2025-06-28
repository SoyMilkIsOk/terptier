import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient(
    { cookies: () => cookieStore } as any,
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const userRecord = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!userRecord) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    id: userRecord.id,
    role: userRecord.role,
    username: userRecord.username,
    profilePicUrl: userRecord.profilePicUrl,
  });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerActionClient(
    { cookies: () => cookieStore } as any,
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
  }

  const { profilePicUrl } = await request.json();

  await prisma.user.update({
    where: { email: user.email },
    data: { profilePicUrl },
  });

  return NextResponse.json({ success: true });
}
