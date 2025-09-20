import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  try {
    const stateParam = request.nextUrl.searchParams
      .get("state")
      ?.toLowerCase();

    if (!stateParam) {
      return NextResponse.json(
        { flower: [], hash: [], error: "State slug is required" },
        { status: 400 },
      );
    }

    const state = await prisma.state.findUnique({ where: { slug: stateParam } });

    if (!state) {
      return NextResponse.json(
        { flower: [], hash: [], error: "State not found" },
        { status: 404 },
      );
    }

    const [flower, hash] = await Promise.all([
      prisma.producer.findMany({
        where: { category: "FLOWER", stateId: state.id },
        include: {
          votes: true,
          _count: { select: { comments: true } },
          state: { select: { slug: true } },
        },
      }),
      prisma.producer.findMany({
        where: { category: "HASH", stateId: state.id },
        include: {
          votes: true,
          _count: { select: { comments: true } },
          state: { select: { slug: true } },
        },
      }),
    ]);
    return NextResponse.json({ flower, hash, state: { slug: state.slug } });
  } catch (err: any) {
    console.error("[/api/producers] error:", err);
    // always return JSON, even on error
    return NextResponse.json(
      { flower: [], hash: [], error: err.message ?? "Unknown" },
      { status: 500 },
    );
  }
}
