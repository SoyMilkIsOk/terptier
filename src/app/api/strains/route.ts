import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize, JwtClaims } from "@/lib/authorize";
import { Role } from "@prisma/client";

interface CreateStrainBody {
  producerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  releaseDate?: string | null;
  strainSlug?: string;
}

async function canManageProducer(
  producerId: string,
  claims: JwtClaims | null,
  session: any,
) {
  if (claims?.role === "ADMIN") return true;
  const producerClaims = claims?.producer_ids;
  if (Array.isArray(producerClaims) && producerClaims.includes(producerId)) {
    return true;
  }
  const stateIdsClaim = claims?.state_ids;
  const stateSlugsClaim = claims?.state_slugs;
  if (
    (Array.isArray(stateIdsClaim) && stateIdsClaim.length > 0) ||
    (Array.isArray(stateSlugsClaim) && stateSlugsClaim.length > 0)
  ) {
    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
      select: { stateId: true, state: { select: { slug: true } } },
    });

    if (producer) {
      if (Array.isArray(stateIdsClaim) && stateIdsClaim.includes(producer.stateId)) {
        return true;
      }

      const stateSlug = producer.state?.slug;
      if (
        stateSlug &&
        Array.isArray(stateSlugsClaim) &&
        stateSlugsClaim.includes(stateSlug)
      ) {
        return true;
      }
    }
  }
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { producerAdmins: true },
    });
    if (user) {
      return (
        user.role === Role.ADMIN ||
        user.producerAdmins.some((pa) => pa.producerId === producerId)
      );
    }
  }
  return false;
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
  if (!(await canManageProducer(producerId, claims, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
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
  const { session, claims } = await authorize();

  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (!body.producerId || !body.name) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }
  if (!(await canManageProducer(body.producerId, claims, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const producer = await prisma.producer.findUnique({
      where: { id: body.producerId },
      select: { stateId: true },
    });

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
