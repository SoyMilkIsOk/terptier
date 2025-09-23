import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";
import {
  evaluateAdminAccess,
  getAdminScopedUserByEmail,
} from "@/lib/adminAuthorization";

interface CreateStrainBody {
  producerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  releaseDate?: string | null;
  strainSlug?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const producerId = searchParams.get("producerId");
  const { user, claims } = await authorize();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (!producerId) {
    return NextResponse.json({ success: false, error: "Missing producerId" }, { status: 400 });
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const user = await getAdminScopedUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const access = await evaluateAdminAccess(
    { user, claims },
    { targetProducerId: producerId },
  );

  if (!access.allowed) {
    const status = access.reason === "producer_not_found" ? 404 : 403;
    const message =
      access.reason === "producer_not_found" ? "Producer not found" : "Forbidden";
    return NextResponse.json({ success: false, error: message }, { status });
  }

  try {
    const strains = await prisma.strain.findMany({
      where: { producerId },
      select: {
        id: true,
        strainSlug: true,
        name: true,
        description: true,
        imageUrl: true,
        releaseDate: true,
        producerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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
  const { user, claims } = await authorize();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (!body.producerId || !body.name) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const user = await getAdminScopedUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const access = await evaluateAdminAccess(
    { user, claims },
    { targetProducerId: body.producerId },
  );

  if (!access.allowed) {
    const status = access.reason === "producer_not_found" ? 404 : 403;
    const message =
      access.reason === "producer_not_found" ? "Producer not found" : "Forbidden";
    return NextResponse.json({ success: false, error: message }, { status });
  }

  try {
    const producer = access.producer;
    if (!producer) {
      return NextResponse.json({ success: false, error: "Producer not found" }, { status: 404 });
    }

    const strain = await prisma.strain.create({
      data: {
        producerId: body.producerId,
        stateId: producer.stateId,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
        strainSlug: body.strainSlug,
      },
      select: {
        id: true,
        strainSlug: true,
        name: true,
        description: true,
        imageUrl: true,
        releaseDate: true,
        producerId: true,
        createdAt: true,
        updatedAt: true,
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
