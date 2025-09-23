import { cookies } from "next/headers";

export type SupabaseCookieStore = Awaited<ReturnType<typeof cookies>>;

export type SupabaseCookieContext = {
  cookies: () => ReturnType<typeof cookies>;
};

export async function getSupabaseCookieContext(): Promise<{
  cookieStore: SupabaseCookieStore;
  cookieContext: SupabaseCookieContext;
}> {
  const cookieStore = await cookies();
  const cookieContext: SupabaseCookieContext = {
    cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
  };

  return { cookieStore, cookieContext };
}
