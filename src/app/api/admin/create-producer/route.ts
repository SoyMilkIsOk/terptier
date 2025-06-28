import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
import { Role } from "@prisma/client";

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userRecord = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!userRecord || userRecord.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    name,
    category,
    website,
    ingredients,
    slug,
    profileImage,
  } = await request.json();
  await prisma.producer.create({
    data: {
      name,
      category,
      website,
      ingredients,
      slug,
      profileImage,
      createdById: userRecord.id,
    },
  });
  return NextResponse.json({ ok: true });
}