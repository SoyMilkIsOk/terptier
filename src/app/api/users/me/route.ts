import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";


export async function GET() {
  await cookies();
  const supabase = createServerSupabase();
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
  await cookies();
  const supabase = createServerSupabase();
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
