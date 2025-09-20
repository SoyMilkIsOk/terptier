// src/app/api/producers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"; // Correct import for Route Handlers
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
import { Role } from "@prisma/client";

function getStateSlug(request: NextRequest) {
  return request.nextUrl.searchParams.get("state")?.toLowerCase();
}

async function ensureProducerInState(producerId: string, stateSlug: string) {
  return prisma.producer.findFirst({
    where: { id: producerId, state: { slug: stateSlug } },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stateSlug = getStateSlug(request);
    if (!stateSlug) {
      return NextResponse.json(
        { success: false, error: "State slug is required" },
        { status: 400 },
      );
    }

    // 1. Authentication & Authorization
    const supabase = createServerActionClient({ cookies }, {
      supabaseUrl,
      supabaseKey,
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Fetch Prisma user to check role
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email! }, // Assuming email is reliable for fetching user
    });

    if (!prismaUser || prismaUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    // 2. Deletion Logic
    const { id: producerId } = await params;

    if (!producerId) {
      return NextResponse.json(
        { success: false, error: "Producer ID is missing" },
        { status: 400 },
      );
    }

    const producer = await ensureProducerInState(producerId, stateSlug);

    if (!producer) {
      return NextResponse.json(
        { success: false, error: "Producer not found" },
        { status: 404 },
      );
    }

    await prisma.producer.delete({
      where: { id: producerId },
    });

    console.log(`[API] Producer ${producerId} deleted by admin ${session.user.email}`);
    return NextResponse.json({ success: true, message: "Producer deleted successfully" });
  } catch (error: any) {
    console.error("[API DELETE /api/producers/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stateSlug = getStateSlug(request);
    if (!stateSlug) {
      return NextResponse.json(
        { success: false, error: "State slug is required" },
        { status: 400 },
      );
    }

    const supabase = createServerActionClient({ cookies }, {
      supabaseUrl,
      supabaseKey,
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!prismaUser || prismaUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const data = await request.json();

    const { stateSlug: bodyStateSlug, stateCode, ...rest } = data;

    const existingProducer = await ensureProducerInState(id, stateSlug);
    if (!existingProducer) {
      return NextResponse.json(
        { success: false, error: "Producer not found" },
        { status: 404 },
      );
    }

    let stateId = existingProducer.stateId;
    const normalizedBodySlug =
      typeof bodyStateSlug === "string" ? bodyStateSlug.toLowerCase() : undefined;
    const normalizedBodyCode =
      typeof stateCode === "string" ? stateCode.toUpperCase() : undefined;

    if (normalizedBodySlug && normalizedBodySlug !== stateSlug) {
      const state = await prisma.state.findUnique({ where: { slug: normalizedBodySlug } });
      if (state) {
        stateId = state.id;
      }
    } else if (normalizedBodyCode) {
      const state = await prisma.state.findUnique({ where: { code: normalizedBodyCode } });
      if (state) {
        stateId = state.id;
      }
    }

    await prisma.producer.update({
      where: { id },
      data: {
        ...rest,
        stateId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API PUT /api/producers/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
