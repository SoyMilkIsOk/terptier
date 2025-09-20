import { NextResponse } from "next/server";
import { getAllStateMetadata } from "@/lib/states";

export async function GET() {
  try {
    const states = await getAllStateMetadata();
    return NextResponse.json({
      success: true,
      states: states.map(({ slug, name, abbreviation }) => ({
        slug,
        name,
        abbreviation,
      })),
    });
  } catch (error) {
    console.error("[/api/states] failed to load states", error);
    return NextResponse.json(
      { success: false, error: "Failed to load states" },
      { status: 500 },
    );
  }
}
