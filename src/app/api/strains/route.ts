import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";

interface CreateStrainBody {
  producerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

function canManageProducer(producerId: string, claims: any | null) {
  if (!claims) return false;
  if (claims.role === "ADMIN") return true;
  return Array.isArray(claims.producer_ids) && claims.producer_ids.includes(producerId);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const producerId = searchParams.get("producerId");
  const { session, claims } = await authorize();

  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (!producerId) {
    return NextResponse.json({ success: false, error: "Missing producerId" }, { status: 400 });
  }
  if (!canManageProducer(producerId, claims)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const strains = await prisma.strain.findMany({ where: { producerId } });
    return NextResponse.json({ success: true, strains });
  } catch (err: any) {
    console.error("[GET /api/strains]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateStrainBody;
  const { session, claims } = await authorize();

  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (!body.producerId || !body.name) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }
  if (!canManageProducer(body.producerId, claims)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const strain = await prisma.strain.create({
      data: {
        producerId: body.producerId,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });
    return NextResponse.json({ success: true, strain });
  } catch (err: any) {
    console.error("[POST /api/strains]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
