import type { Market } from "@prisma/client";

export type SearchTheme = {
  icon: string;
  input: string;
  inputFocus: string;
  filterButton: string;
  filterButtonActive: string;
  clearButton: string;
  focusRing: string;
  panel: string;
  attributeTag: string;
  attributeTagSelected: string;
  attributeCheckbox: string;
  attributeIcon: string;
  attributeText: string;
};

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
  search: SearchTheme;
};

type RankingsTheme = {
  page: string;
  hero: DropsTheme["hero"];
  content: string;
  button: string;
  producerCardAppearance: "light" | "gray" | "dark";
  search: SearchTheme;
};

type MarketTheme = {
  drops: DropsTheme;
  rankings: RankingsTheme;
};

const WHITE_SEARCH_THEME: SearchTheme = {
  icon: "text-emerald-500",
  input:
    "bg-white/90 border border-emerald-200 text-slate-900 placeholder-emerald-300/80 hover:border-emerald-300",
  inputFocus: "bg-white shadow-lg shadow-emerald-100/70 border-emerald-400",
  filterButton: "text-emerald-600 hover:text-emerald-700",
  filterButtonActive: "text-emerald-700",
  clearButton: "text-emerald-400 hover:text-emerald-600",
  focusRing: "ring-emerald-300",
  panel:
    "bg-white/95 border border-emerald-100 shadow-lg shadow-emerald-100/60 backdrop-blur",
  attributeTag: "bg-emerald-50/80 border border-emerald-100 text-emerald-700",
  attributeTagSelected: "bg-emerald-100 border-emerald-300 text-emerald-800",
  attributeCheckbox: "text-emerald-600",
  attributeIcon: "text-emerald-500",
  attributeText: "text-emerald-800",
};

const BOTH_SEARCH_THEME: SearchTheme = {
  icon: "text-emerald-500",
  input:
    "bg-white/85 border border-emerald-200/70 text-slate-900 placeholder-emerald-300/70 hover:border-emerald-300",
  inputFocus: "bg-white shadow-lg shadow-emerald-200/50 border-emerald-400",
  filterButton: "text-emerald-600 hover:text-emerald-700",
  filterButtonActive: "text-emerald-700",
  clearButton: "text-emerald-400 hover:text-emerald-600",
  focusRing: "ring-emerald-400",
  panel:
    "bg-white/90 border border-emerald-200/70 shadow-lg shadow-emerald-200/40 backdrop-blur",
  attributeTag: "bg-emerald-50/80 border border-emerald-100 text-emerald-700",
  attributeTagSelected: "bg-emerald-100 border-emerald-300 text-emerald-800",
  attributeCheckbox: "text-emerald-600",
  attributeIcon: "text-emerald-500",
  attributeText: "text-emerald-800",
};

const BLACK_SEARCH_THEME: SearchTheme = {
  icon: "text-emerald-300",
  input:
    "bg-emerald-950/70 border border-emerald-900 text-emerald-100 placeholder-emerald-300/70 hover:border-emerald-600/70",
  inputFocus:
    "bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-900/50",
  filterButton: "text-emerald-300 hover:text-emerald-200",
  filterButtonActive: "text-emerald-200",
  clearButton: "text-emerald-400 hover:text-emerald-200",
  focusRing: "ring-emerald-500",
  panel:
    "bg-emerald-950/90 border border-emerald-900 shadow-lg shadow-emerald-900/30 backdrop-blur",
  attributeTag: "bg-emerald-950/60 border border-emerald-800 text-emerald-200",
  attributeTagSelected: "bg-emerald-900/70 border-emerald-600 text-emerald-100",
  attributeCheckbox: "text-emerald-400",
  attributeIcon: "text-emerald-300",
  attributeText: "text-emerald-100",
};

const MARKET_THEME: Record<Market, MarketTheme> = {
  WHITE: {
    drops: {
      page:
        "bg-gradient-to-br from-white via-emerald-50 to-white text-slate-900",
      hero: {
        wrapper: "from-emerald-600 via-emerald-600 to-emerald-700 text-white",
        overlay: "bg-emerald-900/10",
        chip: "bg-white/20 text-white",
        title: "bg-gradient-to-r from-white to-emerald-100",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-200/80",
      },
      content: "",
      empty: {
        icon: "bg-emerald-50 text-emerald-300",
        heading: "text-emerald-900",
        text: "text-emerald-600",
      },
      card: {
        container:
          "bg-white text-slate-900 border border-emerald-100 shadow-sm",
        header: "from-emerald-500 via-emerald-600 to-emerald-700 text-white",
        headerOverlay: "bg-black/10",
        avatar: "bg-white",
        avatarFallback:
          "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white",
        infoText: "text-white",
        category: "text-emerald-100",
        meta: "text-emerald-100",
        action:
          "bg-white/20 text-white border border-white/20 hover:bg-white/30",
        actionHover: "hover:bg-white/30",
        body: "bg-emerald-50/40",
        footer: "text-emerald-700 border border-emerald-200",
        footerHover: "hover:bg-emerald-50/60",
      },
      strainCard: {
        container: "bg-white text-slate-900 hover:bg-emerald-50/80",
        meta: "text-emerald-600",
      },
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
      search: WHITE_SEARCH_THEME,
    },
    rankings: {
      page:
        "bg-gradient-to-br from-white via-emerald-50 to-white text-slate-900",
      hero: {
        wrapper: "from-emerald-600 via-emerald-600 to-emerald-700 text-white",
        overlay: "bg-emerald-900/10",
        chip: "bg-white/20 text-white",
        title: "bg-gradient-to-r from-white to-emerald-100",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-200/80",
      },
      content: "",
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
      producerCardAppearance: "light",
      search: WHITE_SEARCH_THEME,
    },
  },
  BOTH: {
    drops: {
      page:
        "bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 text-slate-900",
      hero: {
        wrapper: "from-emerald-600 via-emerald-700 to-emerald-800 text-white",
        overlay: "bg-emerald-950/10",
        chip: "bg-emerald-900/20 text-emerald-50",
        title: "bg-gradient-to-r from-white to-emerald-200",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-200/80",
      },
      content: "",
      empty: {
        icon: "bg-emerald-100 text-emerald-300",
        heading: "text-emerald-900",
        text: "text-emerald-700",
      },
      card: {
        container:
          "bg-white/90 text-slate-900 border border-emerald-200/60 shadow-sm backdrop-blur",
        header: "from-emerald-600 via-emerald-700 to-emerald-800 text-white",
        headerOverlay: "bg-black/15",
        avatar: "bg-white/90",
        avatarFallback:
          "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white",
        infoText: "text-white",
        category: "text-emerald-100",
        meta: "text-emerald-100",
        action:
          "bg-white/20 text-white border border-white/20 hover:bg-white/25",
        actionHover: "hover:bg-white/25",
        body: "bg-emerald-50/40",
        footer: "text-emerald-700 border border-emerald-300/70",
        footerHover: "hover:bg-emerald-50/60",
      },
      strainCard: {
        container: "bg-white/85 text-slate-900 hover:bg-emerald-50/70",
        meta: "text-emerald-700",
      },
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
      search: BOTH_SEARCH_THEME,
    },
    rankings: {
      page:
        "bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 text-slate-900",
      hero: {
        wrapper: "from-emerald-600 via-emerald-700 to-emerald-800 text-white",
        overlay: "bg-emerald-950/10",
        chip: "bg-emerald-900/20 text-emerald-50",
        title: "bg-gradient-to-r from-white to-emerald-200",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-200/80",
      },
      content: "",
      button:
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60",
      producerCardAppearance: "gray",
      search: BOTH_SEARCH_THEME,
    },
  },
  BLACK: {
    drops: {
      page:
        "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-emerald-50",
      hero: {
        wrapper: "from-emerald-700 via-emerald-800 to-emerald-900 text-white",
        overlay: "bg-black/40",
        chip: "bg-emerald-900/40 text-emerald-100",
        title: "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-400",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-500/40",
      },
      content: "",
      empty: {
        icon: "bg-emerald-950/70 text-emerald-300",
        heading: "text-emerald-50",
        text: "text-emerald-200",
      },
      card: {
        container:
          "bg-slate-900/70 text-emerald-50 border border-emerald-900/40 backdrop-blur",
        header: "from-emerald-700 via-emerald-800 to-emerald-900 text-emerald-50",
        headerOverlay: "bg-black/40",
        avatar: "bg-emerald-950",
        avatarFallback:
          "bg-gradient-to-br from-emerald-700 to-emerald-900 text-emerald-100",
        infoText: "text-emerald-50",
        category: "text-emerald-200",
        meta: "text-emerald-200",
        action:
          "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 hover:bg-emerald-500/30",
        actionHover: "hover:bg-emerald-500/30",
        body: "bg-emerald-950/40",
        footer: "text-emerald-200 border border-emerald-600/40",
        footerHover: "hover:bg-emerald-900/50",
      },
      strainCard: {
        container: "bg-slate-900/80 text-emerald-50 hover:bg-emerald-900/40",
        meta: "text-emerald-200",
      },
      button:
        "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border border-emerald-400",
      search: BLACK_SEARCH_THEME,
    },
    rankings: {
      page:
        "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-emerald-50",
      hero: {
        wrapper: "from-emerald-700 via-emerald-800 to-emerald-900 text-white",
        overlay: "bg-black/40",
        chip: "bg-emerald-900/40 text-emerald-100",
        title: "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-400",
        subtitle: "text-emerald-100",
        statText: "text-emerald-100",
        divider: "bg-emerald-500/40",
      },
      content: "",
      button:
        "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border border-emerald-400",
      producerCardAppearance: "dark",
      search: BLACK_SEARCH_THEME,
    },
  },
};

export function getMarketTheme(market: Market): MarketTheme {
  return MARKET_THEME[market];
}
