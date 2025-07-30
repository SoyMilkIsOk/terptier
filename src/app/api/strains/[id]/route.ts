import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";

interface UpdateStrainBody {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
}

function canManageProducer(producerId: string, claims: any | null) {
  if (!claims) return false;
  if (claims.role === "ADMIN") return true;
  return Array.isArray(claims.producer_ids) && claims.producer_ids.includes(producerId);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strain = await prisma.strain.findUnique({ where: { id: params.id } });
    if (!strain) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const { session, claims } = await authorize();
    if (!session || !canManageProducer(strain.producerId, claims)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, strain });
  } catch (err: any) {
    console.error("[GET /api/strains/:id]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, claims } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const existing = await prisma.strain.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!canManageProducer(existing.producerId, claims)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as UpdateStrainBody;
  try {
    const strain = await prisma.strain.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, strain });
  } catch (err: any) {
    console.error("[PUT /api/strains/:id]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, claims } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const existing = await prisma.strain.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!canManageProducer(existing.producerId, claims)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.strain.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/strains/:id]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
