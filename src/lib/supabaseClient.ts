// src/lib/supabaseClient.ts
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing");
}

export const supabase = createPagesBrowserClient({
  supabaseUrl: supabaseUrl || "",
  supabaseKey: supabaseKey || "",
});
