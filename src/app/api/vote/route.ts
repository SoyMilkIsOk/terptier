// src/app/api/vote/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const originalRequestBody = await request.clone().text();
    console.log("[/api/vote] Received raw request body:", originalRequestBody);

    // 1) Authenticate via Supabase
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    const { email, user_metadata } = session.user;

    // 2) Upsert Prisma user BY EMAIL (not by id), so it matches any seed
    const prismaUser = await prisma.user.upsert({
      where: { email: email! },
      update: {
        name: user_metadata?.full_name || email!,
      },
      create: {
        id: session.user.id, // Use Supabase user.id as the User's primary key
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
    const { producerId, value } = parsedBody as { // Use parsedBody here
      producerId?: string;
      value?: number;
    };
    if (!producerId || typeof value !== "number") {
      console.error("[/api/vote] Validation Error. producerId:", producerId, "value:", value);
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid producerId/value",
        },
        { status: 400 }
      );
    }

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
      },
      update: { value },
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
