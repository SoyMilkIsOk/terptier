// src/app/[stateName]/rankings/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import { Category } from "@prisma/client";
import { getStateMetadata } from "@/lib/states";
import { notFound } from "next/navigation";
import MarketModeToggle from "@/components/MarketModeToggle";
import StateSelector from "@/components/StateSelector";
import { buildMarketFilters, normalizeMarketParam } from "@/lib/market";
import { getMarketTheme } from "@/lib/market-theme";
import { Crown, Users, Star, Flower2, FlaskConical, Shield } from "lucide-react";
import { getStateRankingsPageTitle, getStaticPageTitle } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateName: string }>;
}): Promise<Metadata> {
  const { stateName } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    return { title: getStaticPageTitle("stateRankings") };
  }

  return { title: getStateRankingsPageTitle(state.name) };
}

export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ stateName: string }>;
  searchParams: Promise<{ view?: string; market?: string }>;
}) {
  const [{ stateName }, { view, market: marketParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const state = await getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  const stateSlug = state.slug;
  const normalizedStateSlug = stateSlug.toLowerCase();
  const selectedMarket = normalizeMarketParam(marketParam);
  const marketFilters = buildMarketFilters(selectedMarket);
  const themeAttribute = selectedMarket.toLowerCase();
  const theme = getMarketTheme(selectedMarket).rankings;

  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  if (!is21) return <AgeGate />;

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userVotes: Record<string, number> = {};
  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          stateAdmins: {
            include: { state: { select: { slug: true } } },
          },
        },
      })
    : null;

  const isAdminForState = Boolean(
    currentUser &&
      (currentUser.role === "ADMIN" ||
        (currentUser.stateAdmins?.some((assignment) => {
          const slug = assignment.state?.slug?.toLowerCase();
          return slug === normalizedStateSlug;
        }) ?? false)),
  );

  if (currentUser) {
    const votes = await prisma.vote.findMany({
      where: { userId: currentUser.id },
    });

    votes.forEach((vote) => {
      userVotes[vote.producerId] = vote.value;
    });
  }

  const flowerRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.FLOWER,
      market: { in: marketFilters },
    },
    include: {
      votes: true,
      _count: { select: { comments: true } },
      strains: {
        select: {
          StrainReview: {
            select: {
              id: true,
              comment: true,
            },
          },
        },
      },
    },
  })) as any[]; // Using any[] temporarily effectively, casting to ProducerWithVotes later after sanitization

  const hashRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.HASH,
      market: { in: marketFilters },
    },
    include: {
      votes: true,
      _count: { select: { comments: true } },
      strains: {
        select: {
          StrainReview: {
            select: {
              id: true,
              comment: true,
            },
          },
        },
      },
    },
  })) as any[];

  const score = (p: ProducerWithVotes) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    return p.votes.length > 0 ? total / p.votes.length : 0;
  };

  const flower = flowerRaw.sort((a, b) => score(b) - score(a));
  const hash = hashRaw.sort((a, b) => score(b) - score(a));

  const initialViewParam = view === "hash" ? "hash" : "flower";

  const totalProducers = flower.length + hash.length;

  // Calculate total engagement:
  // Producer Votes + Producer Comments + Strain Votes + Strain Comments
  let totalEngagement = 0;

  const calculateEngagement = (producers: any[]) => {
    producers.forEach((p) => {
      // Producer Votes
      totalEngagement += p.votes.length;
      // Producer Comments
      totalEngagement += p._count?.comments || 0;

      // Strain engagement
      if (p.strains) {
        p.strains.forEach((s: any) => {
          if (s.StrainReview) {
            // Strain Votes (Reviews)
            totalEngagement += s.StrainReview.length;
            // Strain Comments
            s.StrainReview.forEach((r: any) => {
              if (r.comment && r.comment.trim().length > 0) {
                totalEngagement += 1;
              }
            });
          }
        });
      }
    });
  };

  calculateEngagement(flower);
  calculateEngagement(hash);

  // Sanitize data to match ProducerWithVotes type and remove heavy strain data
  // casting to unknown first to avoid ts errors during map
  const sanitize = (list: any[]): ProducerWithVotes[] => {
    return list.map((p) => {
      const { strains, ...rest } = p;
      return rest as ProducerWithVotes;
    });
  };

  const cleanFlower = sanitize(flower);
  const cleanHash = sanitize(hash);


  const marketDescriptor =
    selectedMarket === "WHITE"
      ? "Recreational"
      : selectedMarket === "BLACK"
      ? "Medical"
      : "";

  const heroTitle = `${state.name}'s Top ${
    marketDescriptor ? `${marketDescriptor} ` : ""
  }Producers`;

  return (
    <div
      data-market-theme={themeAttribute}
      className={`min-h-screen transition-colors duration-500 ${theme.page}`}
    >
      <Suspense fallback={null}>
        {/* <MarketModeToggle
          className="fixed bottom-6 left-6 z-50"
          value={selectedMarket}
        /> */}
      </Suspense>
      <div
        className={`relative overflow-visible bg-gradient-to-r transition-colors duration-500 ${theme.hero.wrapper}`}
      >
        <div
          className={`absolute inset-0 transition-colors duration-500 ${theme.hero.overlay}`}
        ></div>
        <div className="relative mx-auto px-4 py-16">
          {isAdminForState && (
            <div className="absolute right-4 top-4">
              <Link
                href={`/${stateSlug}/admin`}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-green-500"
              >
                <Shield className="h-4 w-4" />
                <span className="sm:block hidden">Manage Producers</span>
              </Link>
            </div>
          )}
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`inline-flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2 mb-4 transition-colors duration-500 ${theme.hero.chip}`}
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Community Rankings</span>
            </div>

            <h1
              className={`text-5xl md:text-6xl font-bold mb-4 py-4 bg-clip-text text-transparent transition-colors duration-500 ${theme.hero.title}`}
            >
              {heroTitle}
            </h1>

            <div
              className={`flex flex-wrap sm:w-full w-[80%] mx-auto items-center justify-center py-2 sm:gap-6 gap-8 transition-colors duration-500 ${theme.hero.statText}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalProducers} Brand{totalProducers === 1 ? "" : "s"}
                </span>
              </div>
              <div
                className={`hidden sm:block w-px h-4 transition-colors duration-500 ${theme.hero.divider}`}
              ></div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalEngagement} Votes & Comments
                </span>
              </div>
              <div
                className={`hidden sm:block w-px h-4 transition-colors duration-500 ${theme.hero.divider}`}
              ></div>
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {flower.length} Grower{flower.length === 1 ? "" : "s"}
                </span>
              </div>
              <div
                className={`hidden sm:block w-px h-4 transition-colors duration-500 ${theme.hero.divider}`}
              ></div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {hash.length} Hash Maker{hash.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <StateSelector />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`container mx-auto px-2 md:px-4 py-10 md:py-12 transition-colors duration-500 ${theme.content}`}
      >
        <ProducerList
          initialData={{ flower: cleanFlower, hash: cleanHash }}
          userVotes={userVotes}
          initialView={initialViewParam}
          cardAppearance={theme.producerCardAppearance}
          searchTheme={theme.search}
          toggleTheme={theme.toggle}
        />

        <div className="text-center mt-8">
          <Link
            href="/feedback"
            className={`inline-block px-4 py-2 rounded-md font-medium transition-colors duration-200 ${theme.button}`}
          >
            Missing Your Favorite?
          </Link>
        </div>
      </div>
    </div>
  );
}
