// src/app/api/producers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

import { Role } from "@prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication & Authorization
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch Prisma user to check role
    const prismaUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email! }, // Assuming email is reliable for fetching user
    });

    if (!prismaUser || prismaUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 2. Deletion Logic
    const { id: producerId } = await params;

    if (!producerId) {
      return NextResponse.json(
        { success: false, error: "Producer ID is missing" },
        { status: 400 }
      );
    }

    // Check if producer exists before attempting to delete (optional, delete throws error if not found)
    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
    });

    if (!producer) {
      return NextResponse.json(
        { success: false, error: "Producer not found" },
        { status: 404 }
      );
    }

    await prisma.producer.delete({
      where: { id: producerId },
    });

    console.log(
      `[API] Producer ${producerId} deleted by admin ${supabaseUser.email}`
    );
    return NextResponse.json({ success: true, message: "Producer deleted successfully" });

  } catch (error: any) {
    console.error("[API DELETE /api/producers/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
