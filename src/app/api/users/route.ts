// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const username = searchParams.get("username");

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: Boolean(user) });
  }

  if (username) {
    const user = await prisma.user.findUnique({ where: { username } });
    return NextResponse.json({ exists: Boolean(user) });
  }

  return NextResponse.json({ exists: false });
}

export async function POST(request: Request) {
  const { id, email, name, username, birthday, profilePicUrl, socialLink } =
    await request.json();

  const role = email === process.env.ADMIN_EMAIL ? Role.ADMIN : Role.USER;

  // Upsert a Prisma User record matching the Supabase user
  // Use email as the unique key to support existing accounts
  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      username,
      birthday: birthday ? new Date(birthday) : undefined,
      profilePicUrl,
      socialLink,
      role,
    },
    create: {
      id,
      email,
      name,
      username,
      birthday: birthday ? new Date(birthday) : undefined,
      profilePicUrl,
      socialLink,
      role,
    },
  });

  return NextResponse.json({ ok: true });
}
