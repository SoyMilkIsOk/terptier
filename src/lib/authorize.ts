import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseCookieContext } from "./supabaseCookieContext";
import { getVerifiedAuth } from "./supabaseAuth";

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
  state_ids?: string[];
  state_slugs?: string[];
  [key: string]: any;
}

export function decodeJwt(token: string): JwtClaims {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export async function authorize() {
  const { cookieContext } = await getSupabaseCookieContext();
  const supabase = createServerComponentClient(
    cookieContext,
    {
      supabaseUrl,
      supabaseKey,
    },
  );

  const { user, session } = await getVerifiedAuth(supabase);

  if (!user || !session) return { session: null, user: null, claims: null };

  const claims = decodeJwt(session.access_token);
  return { session, user, claims };
}
