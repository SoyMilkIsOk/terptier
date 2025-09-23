// src/app/api/producers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"; // Correct import for Route Handlers
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/authorize";
import {
  evaluateAdminAccess,
  getAdminScopedUserByEmail,
} from "@/lib/adminAuthorization";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function getStateSlug(request: NextRequest) {
  return request.nextUrl.searchParams.get("state")?.toLowerCase();
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
    const cookieStore = await cookies();
    const supabase = createServerActionClient(
      { cookies: async () => cookieStore },
      {
        supabaseUrl,
        supabaseKey,
      }
    );
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
    const { id: producerId } = await params;

    if (!producerId) {
      return NextResponse.json(
        { success: false, error: "Producer ID is missing" },
        { status: 400 },
      );
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const user = await getAdminScopedUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const claims = decodeJwt(session.access_token);
    const access = await evaluateAdminAccess(
      { user, claims },
      { targetProducerId: producerId, targetStateSlug: stateSlug },
    );

    if (!access.allowed) {
      const status = access.reason === "producer_not_found" ? 404 : 403;
      const message =
        access.reason === "producer_not_found"
          ? "Producer not found"
          : "Forbidden";
      return NextResponse.json(
        { success: false, error: message },
        { status },
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

    const cookieStore = await cookies();
    const supabase = createServerActionClient(
      { cookies: async () => cookieStore },
      {
        supabaseUrl,
        supabaseKey,
      }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const data = await request.json();

    const {
      stateSlug: _bodyStateSlug,
      stateCode: _bodyStateCode,
      stateId: _bodyStateId,
      state: _bodyState,
      ...rest
    } = data;

    const MARKET_VALUES = ["WHITE", "BOTH", "BLACK"] as const;
    type MarketValue = (typeof MARKET_VALUES)[number];
    const allowedMarkets = new Set<MarketValue>(MARKET_VALUES);
    const { market: rawMarket, ...otherUpdates } = rest as {
      market?: unknown;
      [key: string]: unknown;
    };

    if (rawMarket !== undefined) {
      if (typeof rawMarket !== "string") {
        return NextResponse.json(
          { success: false, error: "Invalid market" },
          { status: 400 },
        );
      }
      const normalizedMarket = rawMarket.toUpperCase();
      if (!allowedMarkets.has(normalizedMarket as MarketValue)) {
        return NextResponse.json(
          { success: false, error: "Invalid market" },
          { status: 400 },
        );
      }
      (otherUpdates as { market: MarketValue }).market = normalizedMarket as MarketValue;
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const user = await getAdminScopedUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const claims = decodeJwt(session.access_token);
    const access = await evaluateAdminAccess(
      { user, claims },
      { targetProducerId: id, targetStateSlug: stateSlug },
    );
    if (!access.allowed) {
      const status = access.reason === "producer_not_found" ? 404 : 403;
      const message =
        access.reason === "producer_not_found"
          ? "Producer not found"
          : "Forbidden";
      return NextResponse.json(
        { success: false, error: message },
        { status },
      );
    }

    await prisma.producer.update({
      where: { id },
      data: otherUpdates,
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
