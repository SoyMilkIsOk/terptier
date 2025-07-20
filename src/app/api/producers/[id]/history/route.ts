import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const snapshots = await prisma.producerRatingSnapshot.findMany({
      where: { producerId: params.id },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json({ success: true, snapshots });
  } catch (err: any) {
    console.error("[GET /api/producers/[id]/history]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
