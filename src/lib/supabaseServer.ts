// src/lib/supabaseServer.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseCookieContext } from "./supabaseCookieContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing");
}

export const createSupabaseServerClient = async () => {
  const { cookieContext } = await getSupabaseCookieContext();
  return createServerComponentClient(
    cookieContext,
    {
      supabaseUrl: supabaseUrl || "",
      supabaseKey: supabaseKey || "",
    },
  );
};
