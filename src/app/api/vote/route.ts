// src/app/api/vote/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseCookieContext } from "@/lib/supabaseCookieContext";

export async function POST(request: Request) {
  try {
    const originalRequestBody = await request.clone().text();
    console.log("[/api/vote] Received raw request body:", originalRequestBody);

    // 1) Authenticate via Supabase
    const { cookieContext } = await getSupabaseCookieContext();
    const supabase = createServerComponentClient(cookieContext);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    const { email, user_metadata } = user;

    // 2) Upsert Prisma user BY EMAIL (not by id), so it matches any seed
    const prismaUser = await prisma.user.upsert({
      where: { email: email! },
      update: {
        name: user_metadata?.full_name || email!,
      },
      create: {
        email: email!,
        name: user_metadata?.full_name || email!,
      },
    });

    // 3) Parse and validate body
    let parsedBody: any;
    try {
      // Use the cloned body text for parsing, so original request.json() can be used later if needed by other logic
      // or if there are multiple attempts to read. For this case, we just parse it once.
      parsedBody = JSON.parse(originalRequestBody);
      console.log("[/api/vote] Parsed request body:", parsedBody);
    } catch (e: any) {
      console.error("[/api/vote] Error parsing JSON body:", e.message, "Raw body was:", originalRequestBody);
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const { producerId, value, stateSlug } = parsedBody as {
      producerId?: string;
      value?: number;
      stateSlug?: string;
    };
    if (
      !producerId ||
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      console.error(
        "[/api/vote] Validation Error. producerId:",
        producerId,
        "value:",
        value
      );
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid producerId/value",
        },
        { status: 400 }
      );
    }

    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
      select: {
        id: true,
        stateId: true,
        state: { select: { slug: true } },
      },
    });

    if (!producer) {
      return NextResponse.json(
        { success: false, error: "Producer not found" },
        { status: 404 },
      );
    }

    const normalizedSlug = stateSlug?.toLowerCase();
    if (normalizedSlug && producer.state?.slug && producer.state.slug !== normalizedSlug) {
      console.warn(
        "[/api/vote] State slug mismatch for producer",
        producerId,
        "expected",
        producer.state.slug,
        "received",
        normalizedSlug,
      );
    }

    const stateId = producer.stateId;

    // 4) Upsert the vote with the Prisma user’s id
    const vote = await prisma.vote.upsert({
      where: {
        userId_producerId: {
          userId: prismaUser.id,
          producerId,
        },
      },
      create: {
        userId: prismaUser.id,
        producerId,
        value,
        stateId,
      },
      update: { value, stateId },
    });

    // 5) Return success with the vote record
    return NextResponse.json({ success: true, data: vote });
  } catch (err: any) {
    console.error("[/api/vote] unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
