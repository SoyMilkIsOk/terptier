import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

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

const asStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const filtered = value.filter((item): item is string => typeof item === "string");
  return filtered.length ? filtered : undefined;
};

const assignClaimsFromSource = (target: JwtClaims, source: unknown) => {
  if (!source || typeof source !== "object") {
    return;
  }

  const maybeRecord = source as Record<string, unknown>;

  if (typeof maybeRecord.role === "string") {
    target.role = maybeRecord.role;
  }

  const producerIds = asStringArray(maybeRecord.producer_ids);
  if (producerIds) {
    target.producer_ids = producerIds;
  }

  const stateIds = asStringArray(maybeRecord.state_ids);
  if (stateIds) {
    target.state_ids = stateIds;
  }

  const stateSlugs = asStringArray(maybeRecord.state_slugs);
  if (stateSlugs) {
    target.state_slugs = stateSlugs;
  }
};

export const deriveClaimsFromUser = (user: User | null): JwtClaims | null => {
  if (!user) {
    return null;
  }

  const claims: JwtClaims = {};

  assignClaimsFromSource(claims, user.app_metadata?.claims);
  assignClaimsFromSource(claims, user.app_metadata);
  assignClaimsFromSource(claims, user.user_metadata?.claims);
  assignClaimsFromSource(claims, user.user_metadata);

  return Object.keys(claims).length ? claims : null;
};

export async function authorize() {
  const supabase = createServerComponentClient(
    { cookies },
    {
      supabaseUrl,
      supabaseKey,
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, claims: null };
  }

  const claims = deriveClaimsFromUser(user);

  return { user, claims };
}
