import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing");
}

export interface JwtClaims {
  role?: string;
  producer_ids?: string[];
  [key: string]: any;
}

function decodeJwt(token: string): JwtClaims {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export async function authorize() {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { session: null, claims: null };

  const claims = decodeJwt(session.access_token);
  return { session, claims };
}
