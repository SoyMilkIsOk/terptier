import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  try {
    const stateParam = request.nextUrl.searchParams
      .get("state")
      ?.toLowerCase();
    const stateFilter = stateParam ? { state: { slug: stateParam } } : {};

    const [flower, hash] = await Promise.all([
      prisma.producer.findMany({
        where: { category: "FLOWER", ...stateFilter },
        include: { votes: true, _count: { select: { comments: true } } },
      }),
      prisma.producer.findMany({
        where: { category: "HASH", ...stateFilter },
        include: { votes: true, _count: { select: { comments: true } } },
      }),
    ]);
    return NextResponse.json({ flower, hash });
  } catch (err: any) {
    console.error("[/api/producers] error:", err);
    // always return JSON, even on error
    return NextResponse.json(
      { flower: [], hash: [], error: err.message ?? "Unknown" },
      { status: 500 },
    );
  }
}
