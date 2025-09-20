import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/authorize";
import {
  evaluateAdminAccess,
  getAdminScopedUserByEmail,
} from "@/lib/adminAuthorization";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  const supabase = createServerActionClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getAdminScopedUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const claims = decodeJwt(session.access_token);

  const {
    name,
    category,
    website,
    ingredients,
    attributes,
    slug,
    profileImage,
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
      createdById: user.id,
      stateId: state.id,
    },
  });
  return NextResponse.json({ ok: true });
}
