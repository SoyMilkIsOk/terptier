import { NextResponse } from "next/server";
import { recordDailyRanking } from "../../../../../scripts/recordDailyRanking";

export async function GET() {
  try {
    await recordDailyRanking();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/cron/record-daily-ranking] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown" },
      { status: 500 }
    );
  }
}
