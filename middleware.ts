import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NON_STATE_SEGMENTS = new Set([
  "about",
  "admin",
  "error",
  "faq",
  "feedback",
  "login",
  "not-found",
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname === "") {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return NextResponse.next();
  }

  const [first] = segments;
  const normalized = first.toLowerCase();

  if (NON_STATE_SEGMENTS.has(normalized) || normalized.startsWith("_")) {
    return NextResponse.next();
  }

  if (normalized.includes(".")) {
    return NextResponse.next();
  }

  const stateSlugs = await getStateSlugs(request);

  if (!stateSlugs || !stateSlugs.size) {
    return NextResponse.next();
  }

  if (stateSlugs.has(normalized)) {
    return NextResponse.next();
  }

  const notFoundUrl = request.nextUrl.clone();
  notFoundUrl.pathname = "/not-found";
  return NextResponse.rewrite(notFoundUrl);
}

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
