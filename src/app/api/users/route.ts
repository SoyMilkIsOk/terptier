// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const { id, email, name } = await request.json();

  const role = email === process.env.ADMIN_EMAIL ? Role.ADMIN : Role.USER;

  // Upsert a Prisma User record matching the Supabase user
  await prisma.user.upsert({
    where: { id },
    update: {
      email,
      name,
      role,
    },
    create: {
      id,
      email,
      name,
      role,
    },
  });

  return NextResponse.json({ ok: true });
}
