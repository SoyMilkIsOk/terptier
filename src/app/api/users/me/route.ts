import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
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
