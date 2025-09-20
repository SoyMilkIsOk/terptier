// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const username = searchParams.get("username")?.toLowerCase();
  const getEmail = searchParams.get("getEmail");

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: Boolean(user) });
  }

  if (username) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (getEmail) {
      return NextResponse.json({ email: user?.email || null });
    }
    return NextResponse.json({ exists: Boolean(user) });
  }

  return NextResponse.json({ exists: false });
}

export async function POST(request: Request) {
  const {
    id,
    email,
    name,
    username: rawUsername,
    birthday,
    profilePicUrl,
    socialLink,
    notificationOptIn,
  } = await request.json();

  const username = rawUsername?.toLowerCase();

  if (username && !/^[a-z0-9]+$/.test(username)) {
    return NextResponse.json(
      { ok: false, error: "Invalid username" },
      { status: 400 },
    );
  }

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Email is required" },
      { status: 400 },
    );
  }

  const normalizedAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const shouldForceAdmin =
    normalizedAdminEmail && normalizedEmail
      ? normalizedAdminEmail === normalizedEmail
      : false;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const updateData = {
    name,
    username,
    birthday: birthday ? new Date(birthday) : undefined,
    profilePicUrl,
    socialLink,
    notificationOptIn,
    ...(shouldForceAdmin ? { role: Role.ADMIN } : {}),
  } as any;

  const createData = {
    id,
    email,
    name,
    username,
    birthday: birthday ? new Date(birthday) : undefined,
    profilePicUrl,
    socialLink,
    notificationOptIn,
    role: shouldForceAdmin ? Role.ADMIN : Role.USER,
  } as any;

  try {
    // Upsert a Prisma User record matching the Supabase user
    // Use email as the unique key to support existing accounts
    await prisma.user.upsert({
      where: { email },
      update: updateData,
      create: existingUser ? { ...createData, role: existingUser.role } : createData,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("username")) {
      return NextResponse.json(
        { ok: false, error: "Username already taken" },
        { status: 400 }
      );
    }
    console.error("Failed to upsert user", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
