import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import jwtDecode from "jwt-decode";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing");
}

export interface JwtClaims {
  role?: string;
  producer_ids?: string[];
  [key: string]: any;
}

export async function authorize() {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession({ scopes: "role producer_ids" });

  if (!session) return { session: null, claims: null };

  const claims = jwtDecode<JwtClaims>(session.access_token);
  return { session, claims };
}
