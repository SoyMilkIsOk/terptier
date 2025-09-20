import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { authorize } from "@/lib/authorize";
import {
  evaluateAdminAccess,
  getAdminScopedUserByEmail,
} from "@/lib/adminAuthorization";

interface UpdateStrainBody {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  releaseDate?: string | null;
  strainSlug?: string;
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
    if (!session) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const user = await getAdminScopedUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const access = await evaluateAdminAccess(
      { user, claims },
      { targetProducerId: strain.producerId },
    );
    if (!access.allowed) {
      const status = access.reason === "producer_not_found" ? 404 : 403;
      const message =
        access.reason === "producer_not_found" ? "Producer not found" : "Forbidden";
      return NextResponse.json({ success: false, error: message }, { status });
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
  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const user = await getAdminScopedUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const access = await evaluateAdminAccess(
    { user, claims },
    { targetProducerId: existing.producerId },
  );
  if (!access.allowed) {
    const status = access.reason === "producer_not_found" ? 404 : 403;
    const message =
      access.reason === "producer_not_found" ? "Producer not found" : "Forbidden";
    return NextResponse.json({ success: false, error: message }, { status });
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
  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const user = await getAdminScopedUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const access = await evaluateAdminAccess(
    { user, claims },
    { targetProducerId: existing.producerId },
  );
  if (!access.allowed) {
    const status = access.reason === "producer_not_found" ? 404 : 403;
    const message =
      access.reason === "producer_not_found" ? "Producer not found" : "Forbidden";
    return NextResponse.json({ success: false, error: message }, { status });
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
