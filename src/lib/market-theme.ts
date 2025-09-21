import type { Market } from "@prisma/client";

type DropsTheme = {
  page: string;
  hero: {
    wrapper: string;
    overlay: string;
    chip: string;
    title: string;
    subtitle: string;
    statText: string;
    divider: string;
  };
  content: string;
  empty: {
    icon: string;
    heading: string;
    text: string;
  };
  card: {
    container: string;
    header: string;
    headerOverlay: string;
    avatar: string;
    avatarFallback: string;
    infoText: string;
    category: string;
    meta: string;
    action: string;
    actionHover: string;
    body: string;
    footer: string;
    footerHover: string;
  };
  strainCard: {
    container: string;
    meta: string;
  };
  button: string;
};

type RankingsTheme = {
  page: string;
  hero: DropsTheme["hero"];
  content: string;
  button: string;
  producerCardAppearance: "light" | "gray" | "dark";
};

type MarketTheme = {
  drops: DropsTheme;
  rankings: RankingsTheme;
};

const MARKET_THEME: Record<Market, MarketTheme> = {
  WHITE: {
    drops: {
      page:
        "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-900",
      hero: {
        wrapper: "from-green-600 via-emerald-600 to-green-700 text-white",
        overlay: "bg-black/10",
        chip: "bg-white/20 text-white",
        title: "bg-gradient-to-r from-white to-emerald-100",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-300/80",
      },
      content: "",
      empty: {
        icon: "bg-gray-100 text-gray-400",
        heading: "text-gray-900",
        text: "text-gray-600",
      },
      card: {
        container:
          "bg-white text-slate-900 border border-emerald-100 shadow-sm",
        header: "from-green-500 via-emerald-600 to-green-700 text-white",
        headerOverlay: "bg-black/20",
        avatar: "bg-white",
        avatarFallback:
          "bg-gradient-to-br from-green-400 to-emerald-500 text-white",
        infoText: "text-white",
        category: "text-emerald-200",
        meta: "text-emerald-100",
        action:
          "bg-white/20 text-white border border-white/20 hover:bg-white/30",
        actionHover: "hover:bg-white/30",
        body: "bg-emerald-50/40",
        footer: "text-emerald-700 border border-emerald-200",
        footerHover: "hover:bg-emerald-50/60",
      },
      strainCard: {
        container: "bg-white text-slate-900 hover:bg-emerald-50/70",
        meta: "text-gray-600",
      },
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
    },
    rankings: {
      page:
        "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-900",
      hero: {
        wrapper: "from-green-600 via-emerald-600 to-green-700 text-white",
        overlay: "bg-black/10",
        chip: "bg-white/20 text-white",
        title: "bg-gradient-to-r from-white to-emerald-100",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-300/80",
      },
      content: "",
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
      producerCardAppearance: "light",
    },
  },
  BOTH: {
    drops: {
      page:
        "bg-gradient-to-br from-slate-100 via-zinc-200 to-slate-300 text-slate-800",
      hero: {
        wrapper: "from-slate-500 via-slate-600 to-slate-700 text-white",
        overlay: "bg-black/20",
        chip: "bg-white/15 text-white",
        title: "bg-gradient-to-r from-white/90 to-zinc-200",
        subtitle: "text-slate-200",
        statText: "text-slate-200",
        divider: "bg-slate-300/80",
      },
      content: "",
      empty: {
        icon: "bg-slate-200 text-slate-500",
        heading: "text-slate-800",
        text: "text-slate-600",
      },
      card: {
        container:
          "bg-white/80 text-slate-800 border border-slate-200/70 backdrop-blur",
        header: "from-slate-600 via-slate-700 to-slate-800 text-white",
        headerOverlay: "bg-black/25",
        avatar: "bg-white/80",
        avatarFallback:
          "bg-gradient-to-br from-slate-400 to-slate-600 text-white",
        infoText: "text-white",
        category: "text-slate-200",
        meta: "text-slate-200",
        action:
          "bg-white/15 text-white border border-white/20 hover:bg-white/25",
        actionHover: "hover:bg-white/25",
        body: "bg-slate-100/50",
        footer: "text-slate-800 border border-slate-300",
        footerHover: "hover:bg-white/60",
      },
      strainCard: {
        container: "bg-white/80 text-slate-800 hover:bg-white",
        meta: "text-slate-600",
      },
      button:
        "bg-slate-700 hover:bg-slate-600 text-white border border-white/20",
    },
    rankings: {
      page:
        "bg-gradient-to-br from-slate-100 via-zinc-200 to-slate-300 text-slate-800",
      hero: {
        wrapper: "from-slate-600 via-slate-700 to-slate-800 text-white",
        overlay: "bg-black/25",
        chip: "bg-white/15 text-white",
        title: "bg-gradient-to-r from-white/90 to-zinc-200",
        subtitle: "text-slate-200",
        statText: "text-slate-200",
        divider: "bg-slate-400/70",
      },
      content: "",
      button:
        "bg-slate-700 hover:bg-slate-600 text-white border border-white/20",
      producerCardAppearance: "gray",
    },
  },
  BLACK: {
    drops: {
      page:
        "bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100",
      hero: {
        wrapper: "from-slate-900 via-slate-800 to-slate-950 text-white",
        overlay: "bg-black/50",
        chip: "bg-white/10 text-slate-100",
        title: "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400",
        subtitle: "text-slate-300",
        statText: "text-slate-200",
        divider: "bg-slate-600/70",
      },
      content: "",
      empty: {
        icon: "bg-slate-800 text-slate-400",
        heading: "text-white",
        text: "text-slate-300",
      },
      card: {
        container:
          "bg-slate-900/80 text-slate-100 border border-slate-700 backdrop-blur",
        header: "from-slate-800 via-slate-900 to-black text-white",
        headerOverlay: "bg-black/60",
        avatar: "bg-slate-800",
        avatarFallback:
          "bg-gradient-to-br from-slate-600 to-slate-900 text-white",
        infoText: "text-white",
        category: "text-slate-300",
        meta: "text-slate-300",
        action:
          "bg-white/10 text-white border border-white/10 hover:bg-white/20",
        actionHover: "hover:bg-white/20",
        body: "bg-slate-900/60",
        footer: "text-emerald-300 border border-emerald-500/40",
        footerHover: "hover:bg-emerald-500/10",
      },
      strainCard: {
        container: "bg-slate-900 text-slate-100 hover:bg-slate-800",
        meta: "text-slate-300",
      },
      button:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400",
    },
    rankings: {
      page:
        "bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100",
      hero: {
        wrapper: "from-slate-900 via-slate-800 to-slate-950 text-white",
        overlay: "bg-black/50",
        chip: "bg-white/10 text-slate-100",
        title: "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400",
        subtitle: "text-slate-300",
        statText: "text-slate-200",
        divider: "bg-slate-600/70",
      },
      content: "",
      button:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400",
      producerCardAppearance: "dark",
    },
  },
};

export function getMarketTheme(market: Market): MarketTheme {
  return MARKET_THEME[market];
}
