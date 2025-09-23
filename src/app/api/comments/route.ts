import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { del } from "@vercel/blob";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseCookieContext } from "@/lib/supabaseCookieContext";
import { getVerifiedAuth } from "@/lib/supabaseAuth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const producerId = searchParams.get("producerId");
  const userId = searchParams.get("userId");

  if (!producerId && !userId) {
    return NextResponse.json(
      { success: false, error: "Missing query" },
      { status: 400 }
    );
  }

  const where: any = {};
  if (producerId) where.producerId = producerId;
  if (userId) where.userId = userId;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: true,
      producer: {
        select: {
          id: true,
          name: true,
          slug: true,
          state: { select: { slug: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, comments });
}

export async function POST(request: NextRequest) {
  const { cookieContext } = await getSupabaseCookieContext();
  const supabase = createServerComponentClient(cookieContext);
  const { user } = await getVerifiedAuth(supabase);

  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!prismaUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const { producerId, text, images } = (await request.json()) as {
    producerId: string;
    text: string;
    images: string[];
  };

  if (!producerId) {
    return NextResponse.json(
      { success: false, error: "Missing producerId" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.upsert({
    where: {
      userId_producerId: {
        userId: prismaUser.id,
        producerId,
      },
    },
    create: {
      userId: prismaUser.id,
      producerId,
      text,
      imageUrls: images,
    },
    update: {
      text,
      imageUrls: images,
    },
    include: {
      user: true,
      producer: {
        select: {
          id: true,
          name: true,
          slug: true,
          state: { select: { slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, comment });
}

export async function DELETE(request: NextRequest) {
  const { cookieContext } = await getSupabaseCookieContext();
  const supabase = createServerComponentClient(cookieContext);
  const { user } = await getVerifiedAuth(supabase);

  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing id" },
      { status: 400 }
    );
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!prismaUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.userId !== prismaUser.id) {
    return NextResponse.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  if (comment.imageUrls && comment.imageUrls.length) {
    await Promise.all(
      comment.imageUrls.map(async (url) => {
        try {
          await del(url);
        } catch (err) {
          console.error("Failed to delete blob", err);
        }
      })
    );
  }

  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
