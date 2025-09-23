// src/lib/supabaseAuth.ts
import type {
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

export type VerifiedAuthResult = {
  user: User | null;
  session: Session | null;
};

type GenericSupabaseClient = SupabaseClient<any, any, any>;

export async function getVerifiedAuth(
  supabase: GenericSupabaseClient,
): Promise<VerifiedAuthResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError && sessionError.name !== "AuthSessionMissingError") {
    console.error("Failed to retrieve Supabase session", sessionError);
  }

  if (!session?.access_token) {
    return { user: null, session: null };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (userError.name !== "AuthSessionMissingError") {
      console.error("Failed to verify Supabase user", userError);
    }
    return { user: null, session: null };
  }

  if (!user) {
    return { user: null, session: null };
  }

  return { user, session };
}
