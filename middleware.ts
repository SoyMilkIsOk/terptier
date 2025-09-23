import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const NON_STATE_SEGMENTS = new Set([
  "about",
  "admin",
  "drops",
  "error",
  "faq",
  "feedback",
  "login",
  "not-found",
  "rankings",
  "privacy",
  "profile",
  "signup",
  "terms",
]);

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedStates: { expires: number; slugs: Set<string> } | null = null;

async function getStateSlugs(request: NextRequest): Promise<Set<string> | null> {
  if (cachedStates && cachedStates.expires > Date.now()) {
    return cachedStates.slugs;
  }

  try {
    const response = await fetch(new URL("/api/states", request.url), {
      headers: {
        "x-middleware-fetch": "1",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      states?: { slug: string }[];
    };

    if (!data.success || !data.states) {
      return null;
    }

    const slugs = new Set(
      data.states
        .map((state) => state.slug.toLowerCase())
        .filter((slug) => slug && typeof slug === "string"),
    );

    cachedStates = {
      expires: Date.now() + CACHE_TTL_MS,
      slugs,
    };

    return slugs;
  } catch {
    return null;
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();

  if (pathname !== "/" && pathname !== "") {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length) {
      const [first] = segments;
      const normalized = first.toLowerCase();

      if (
        !NON_STATE_SEGMENTS.has(normalized) &&
        !normalized.startsWith("_") &&
        !normalized.includes(".")
      ) {
        const stateSlugs = await getStateSlugs(request);

        if (stateSlugs?.size && !stateSlugs.has(normalized)) {
          const notFoundUrl = request.nextUrl.clone();
          notFoundUrl.pathname = "/not-found";
          response = NextResponse.rewrite(notFoundUrl);
        }
      }
    }
  }

  if (supabaseUrl && supabaseKey) {
    const supabase = createMiddlewareClient(
      { req: request, res: response },
      { supabaseUrl, supabaseKey }
    );

    try {
      await supabase.auth.getUser();
    } catch (error) {
      console.error("Failed to refresh Supabase session in middleware", error);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
