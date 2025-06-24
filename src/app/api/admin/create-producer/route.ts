import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
  });

  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, category } = await request.json();
  await prisma.producer.create({ data: { name, category, createdById: user.id } });
  return NextResponse.json({ ok: true });
}