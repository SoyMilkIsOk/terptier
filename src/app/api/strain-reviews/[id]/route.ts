import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: async () => cookieStore });
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

  const { id } = await params;

  const existing = await prisma.strainReview.findUnique({ where: { id } });
  if (!existing || existing.userId !== prismaUser.id) {
    return NextResponse.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { comment, flavor, effect, smoke, imageUrl } = body as {
    comment?: string;
    flavor?: number;
    effect?: number;
    smoke?: number;
    imageUrl?: string;
  };

  const newFlavor = flavor ?? existing.flavor;
  const newEffect = effect ?? existing.effect;
  const newSmoke = smoke ?? existing.smoke;
  const aggregateRating = (newFlavor + newEffect + newSmoke) / 3;

  const review = await prisma.strainReview.update({
    where: { id },
    data: {
      comment,
      flavor,
      effect,
      smoke,
      imageUrl,
      aggregateRating,
    },
  });

  return NextResponse.json({ success: true, review });
}
