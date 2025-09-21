// src/app/[stateName]/rankings/page.tsx
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
import { buildMarketFilters, normalizeMarketParam } from "@/lib/market";
import { getMarketTheme } from "@/lib/market-theme";
import {
  Crown,
  Users,
  Star,
  Flower2,
  FlaskConical,
} from "lucide-react";

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

  if (session?.user?.email) {
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (prismaUser) {
      const votes = await prisma.vote.findMany({
        where: { userId: prismaUser.id },
      });

      votes.forEach((vote) => {
        userVotes[vote.producerId] = vote.value;
      });
    }
  }

  const flowerRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.FLOWER,
      market: { in: marketFilters },
    },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const hashRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.HASH,
      market: { in: marketFilters },
    },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const score = (p: ProducerWithVotes) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    return p.votes.length > 0 ? total / p.votes.length : 0;
  };

  const flower = flowerRaw.sort((a, b) => score(b) - score(a));
  const hash = hashRaw.sort((a, b) => score(b) - score(a));

  const initialViewParam = view === "hash" ? "hash" : "flower";

  const totalProducers = flower.length + hash.length;
  const totalVotes =
    [...flower, ...hash].reduce((acc, p) => acc + p.votes.length, 0) || 0;

  const marketDescriptor =
    selectedMarket === "WHITE"
      ? "recreational"
      : selectedMarket === "BLACK"
        ? "underground"
        : "";

  const heroTitle = `${state.name}'s Best ${
    marketDescriptor ? `${marketDescriptor} ` : ""
  }Producers`;

  return (
    <div
      data-market-theme={themeAttribute}
      className={`min-h-screen transition-colors duration-500 ${theme.page}`}
    >
      <MarketModeToggle
        className="fixed bottom-6 left-6 z-50"
        value={selectedMarket}
      />
      <div
        className={`relative overflow-hidden bg-gradient-to-r transition-colors duration-500 ${theme.hero.wrapper}`}
      >
        <div
          className={`absolute inset-0 transition-colors duration-500 ${theme.hero.overlay}`}
        ></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`inline-flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2 mb-6 transition-colors duration-500 ${theme.hero.chip}`}
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
              className={`flex flex-wrap items-center justify-center gap-6 transition-colors duration-500 ${theme.hero.statText}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalProducers} Producer{totalProducers === 1 ? "" : "s"}
                </span>
              </div>
              <div
                className={`hidden sm:block w-px h-4 transition-colors duration-500 ${theme.hero.divider}`}
              ></div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalVotes} Vote{totalVotes === 1 ? "" : "s"}
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
                  {hash.length} Hasher{hash.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`container mx-auto px-2 md:px-4 py-10 md:py-12 transition-colors duration-500 ${theme.content}`}
      >
        <ProducerList
          initialData={{ flower, hash }}
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
