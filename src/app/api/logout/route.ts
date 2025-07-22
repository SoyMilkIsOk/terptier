import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore } as any, {
    supabaseUrl,
    supabaseKey,
  });

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}

export async function GET() {
  return POST();
}
