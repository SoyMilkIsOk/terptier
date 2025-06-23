// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { getRoleForEmail } from "@/utils/role";

export async function POST(request: Request) {
  const { id, email, name } = await request.json();

  const role = getRoleForEmail(email);
  console.log("[POST /api/users] email", email, "role", role);

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
