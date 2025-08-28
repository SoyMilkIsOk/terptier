import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { del } from "@vercel/blob";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const strainId = searchParams.get("strainId");
  const userId = searchParams.get("userId");

  if (!strainId && !userId) {
    return NextResponse.json(
      { success: false, error: "Missing query" },
      { status: 400 }
    );
  }

  const where: any = {};
  if (strainId) where.strainId = strainId;
  if (userId) where.userId = userId;

  const reviews = await prisma.strainReview.findMany({
    where,
    include: { user: true, producer: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, reviews });
}

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!prismaUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const {
    strainId,
    producerId,
    comment,
    flavor,
    effect,
    smoke,
    imageUrl,
  } = (await request.json()) as {
    strainId: string;
    producerId: string;
    comment?: string;
    flavor: number;
    effect: number;
    smoke: number;
    imageUrl?: string;
  };

  if (!strainId || !producerId) {
    return NextResponse.json(
      { success: false, error: "Missing strainId or producerId" },
      { status: 400 }
    );
  }

  const aggregateRating = (flavor + effect + smoke) / 3;

  const review = await prisma.strainReview.upsert({
    where: {
      userId_strainId: {
        userId: prismaUser.id,
        strainId,
      },
    },
    create: {
      userId: prismaUser.id,
      strainId,
      producerId,
      comment,
      flavor,
      effect,
      smoke,
      aggregateRating,
      imageUrl,
    },
    update: {
      comment,
      flavor,
      effect,
      smoke,
      aggregateRating,
      imageUrl,
    },
  });

  return NextResponse.json({ success: true, review });
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
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
    where: { email: session.user.email },
  });

  if (!prismaUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const review = await prisma.strainReview.findUnique({ where: { id } });
  if (!review || review.userId !== prismaUser.id) {
    return NextResponse.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  if (review.imageUrl) {
    try {
      await del(review.imageUrl);
    } catch (err) {
      console.error("Failed to delete blob", err);
    }
  }

  await prisma.strainReview.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
