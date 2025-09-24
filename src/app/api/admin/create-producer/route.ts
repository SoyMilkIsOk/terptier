import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prismadb";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { deriveClaimsFromUser } from "@/lib/authorize";
import {
  evaluateAdminAccess,
  getAdminScopedUserByEmail,
} from "@/lib/adminAuthorization";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getAdminScopedUserByEmail(authUser.email);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const claims = deriveClaimsFromUser(authUser);

  const {
    name,
    category,
    website,
    ingredients,
    attributes,
    slug,
    profileImage,
    market,
    stateCode,
    stateSlug,
  } = await request.json();

  const normalizedSlug =
    typeof stateSlug === "string" ? stateSlug.toLowerCase() : undefined;
  const normalizedCode =
    typeof stateCode === "string" ? stateCode.toUpperCase() : undefined;

  if (!normalizedSlug && !normalizedCode) {
    return NextResponse.json(
      { error: "State slug or code is required" },
      { status: 400 },
    );
  }

  const MARKET_VALUES = ["WHITE", "BOTH", "BLACK"] as const;
  type MarketValue = (typeof MARKET_VALUES)[number];
  const allowedMarkets = new Set<MarketValue>(MARKET_VALUES);
  let normalizedMarket: MarketValue = "BOTH";
  if (typeof market === "string") {
    const candidate = market.toUpperCase();
    if (!allowedMarkets.has(candidate as MarketValue)) {
      return NextResponse.json({ error: "Invalid market" }, { status: 400 });
    }
    normalizedMarket = candidate as MarketValue;
  } else if (market !== undefined && market !== null) {
    return NextResponse.json({ error: "Invalid market" }, { status: 400 });
  }

  let state = null;
  if (normalizedSlug) {
    state = await prisma.state.findUnique({ where: { slug: normalizedSlug } });
    if (!state) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
    if (normalizedCode && normalizedCode !== state.code) {
      return NextResponse.json(
        { error: "State slug and code do not match" },
        { status: 400 },
      );
    }
  } else if (normalizedCode) {
    state = await prisma.state.findUnique({ where: { code: normalizedCode } });
    if (!state) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
  }

  if (!state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }
  const access = await evaluateAdminAccess(
    { user, claims },
    { targetStateId: state.id, targetStateSlug: state.slug },
  );

  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.producer.create({
    data: {
      name,
      category,
      website,
      ingredients,
      attributes,
      slug,
      profileImage,
      market: normalizedMarket,
      createdById: user.id,
      stateId: state.id,
    },
  });
  return NextResponse.json({ ok: true });
}
