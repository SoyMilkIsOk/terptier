import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore } as any, {
    supabaseUrl,
    supabaseKey,
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 400 });
  }
  return NextResponse.json({ success: true, data });
}
