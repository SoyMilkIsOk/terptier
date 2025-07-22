import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  await cookies();
  const supabase = createServerSupabase();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: authUser.email },
  });

  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    name,
    category,
    website,
    ingredients,
    attributes,
    slug,
    profileImage,
  } = await request.json();
  await prisma.producer.create({
    data: {
      name,
      category,
      website,
      ingredients,
      attributes,
      slug,
      profileImage,
      createdById: user.id,
    },
  });
  return NextResponse.json({ ok: true });
}
