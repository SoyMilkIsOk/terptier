import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

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
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, comments });
}

export async function POST(request: NextRequest) {
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

  const prismaUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
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
  });

  return NextResponse.json({ success: true, comment });
}
