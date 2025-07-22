import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore } as any, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: authUser.email },
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
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore } as any, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
  }

  const { profilePicUrl } = await request.json();

  await prisma.user.update({
    where: { email: authUser.email },
    data: { profilePicUrl },
  });

  return NextResponse.json({ success: true });
}
