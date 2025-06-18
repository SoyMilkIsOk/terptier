// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function POST(request: Request) {
  const { id, email, name } = await request.json();

  // Upsert a Prisma User record matching the Supabase user
  await prisma.user.upsert({
    where: { id },
    update: {
      email,
      name,
    },
    create: {
      id,
      email,
      name,
      // passwordHash and role default to null/USER
    },
  });

  return NextResponse.json({ ok: true });
}
