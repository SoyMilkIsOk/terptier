import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize, JwtClaims } from "@/lib/authorize";
import { Role } from "@prisma/client";

interface UpdateStrainBody {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const strain = await prisma.strain.findUnique({
      where: { id },
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
    if (!strain) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const { session, claims } = await authorize();
    if (!session || !(await canManageProducer(strain.producerId, claims, session))) {
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, claims } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.strain.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!(await canManageProducer(existing.producerId, claims, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as UpdateStrainBody;
  try {
    const strain = await prisma.strain.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : body.releaseDate,
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
    console.error("[PUT /api/strains/:id]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, claims } = await authorize();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.strain.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!(await canManageProducer(existing.producerId, claims, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.strain.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/strains/:id]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
