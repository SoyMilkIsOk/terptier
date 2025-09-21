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

export type ToggleTheme = {
  container: string;
  indicator: {
    base: string;
    flower: string;
    hash: string;
  };
  label: {
    base: string;
    active: string;
    inactive: string;
  };
  labelWrapper: {
    flower: string;
    hash: string;
  };
  focusRing: string;
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
  toggle: ToggleTheme;
  search: SearchTheme;
};

type RankingsTheme = {
  page: string;
  hero: DropsTheme["hero"];
  content: string;
  button: string;
  producerCardAppearance: "light" | "gray" | "dark";
  search: SearchTheme;
  toggle: ToggleTheme;
};

type MarketTheme = {
  drops: DropsTheme;
  rankings: RankingsTheme;
};

// Light mode theme for WHITE market
const WHITE_THEME = {
  search: {
    icon: "text-green-600",
    input: "bg-white/60 backdrop-blur-xl border border-gray-200/40 text-gray-900 placeholder-gray-400/60 hover:border-green-300/60",
    inputFocus: "bg-white/70 shadow-2xl shadow-green-100/30 border-green-500/50 backdrop-blur-xl",
    filterButton: "text-green-700 hover:text-green-800",
    filterButtonActive: "text-green-800",
    clearButton: "text-green-500 hover:text-green-700",
    focusRing: "ring-green-400/30",
    panel: "bg-white/70 border border-green-100/50 shadow-2xl shadow-green-100/20 backdrop-blur-xl",
    attributeTag: "bg-green-50/60 backdrop-blur-sm border border-green-200/40 text-green-800",
    attributeTagSelected: "bg-green-100/70 backdrop-blur-sm border-green-400/50 text-green-900",
    attributeCheckbox: "text-green-600",
    attributeIcon: "text-green-600",
    attributeText: "text-green-900",
  },
  page: "bg-gradient-to-br from-white via-green-50/30 to-gray-50/60 text-gray-900",
  hero: {
    wrapper: "bg-green-800",
    overlay: "bg-green-950/5",
    chip: "bg-white/20 backdrop-blur-xl border border-white/20 text-white",
    title: "bg-gradient-to-r from-white via-green-50 to-green-100",
    subtitle: "text-white",
    statText: "text-white",
    divider: "bg-white/30",
  },
  content: "bg-transparent",
  empty: {
    icon: "bg-green-50/60 backdrop-blur-sm text-green-400",
    heading: "text-gray-900",
    text: "text-gray-600",
  },
  card: {
    container: "bg-white/60 backdrop-blur-xl border border-gray-200/30 shadow-xl hover:shadow-2xl hover:bg-white/70 text-gray-900",
    header: "bg-green-800",
    headerOverlay: "bg-green-950/5",
    avatar: "bg-white/80 backdrop-blur-sm shadow-sm",
    avatarFallback: "bg-gray-500 text-white",
    infoText: "text-white",
    category: "text-white/80",
    meta: "text-white/90",
    action: "bg-white/15 backdrop-blur-xl text-white border border-white/20 hover:bg-white/25",
    actionHover: "hover:bg-white/25",
    body: "bg-gray-50/20 backdrop-blur-sm",
    footer: "text-gray-700 border-t border-gray-200/30",
    footerHover: "hover:bg-gray-50/30 backdrop-blur-sm",
  },
  strainCard: {
    container: "bg-white/70 backdrop-blur-xl text-gray-900 hover:bg-gray-50/40 border border-gray-200/30",
    meta: "text-gray-600",
  },
  button: "bg-green-600 hover:bg-green-500 text-white border border-green-500/40 shadow-md hover:shadow-lg",
  toggle: {
    container:
      "bg-white/70 backdrop-blur-xl border border-green-100/60 shadow-inner shadow-green-100/20",
    indicator: {
      base:
        "absolute left-1.5 top-1.5 bottom-1.5 rounded-full transform transition-all duration-300 ease-out shadow-lg",
      flower: "bg-gradient-to-r from-green-500 to-green-600 translate-x-0 w-24",
      hash: "bg-gradient-to-r from-green-500 to-green-600 translate-x-24 w-22",
    },
    label: {
      base: "font-semibold text-sm transition-all duration-300 ease-out",
      active: "text-white drop-shadow-sm",
      inactive: "text-green-700/80 hover:text-green-900",
    },
    labelWrapper: {
      flower: "w-24",
      hash: "w-22",
    },
    focusRing: "ring-green-300/30 ring-opacity-0 focus-within:ring-opacity-80",
  },
};

// Gray mode theme for BOTH market
const BOTH_THEME = {
  search: {
    icon: "text-green-600",
    input: "bg-white/50 backdrop-blur-xl border border-gray-300/40 text-gray-900 placeholder-gray-500/60 hover:border-green-400/50",
    inputFocus: "bg-white/60 shadow-2xl shadow-gray-200/30 border-green-500/50 backdrop-blur-xl",
    filterButton: "text-gray-700 hover:text-green-700",
    filterButtonActive: "text-green-700",
    clearButton: "text-gray-500 hover:text-green-600",
    focusRing: "ring-green-400/30",
    panel: "bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/20",
    attributeTag: "bg-gray-50/60 backdrop-blur-sm border border-gray-300/40 text-gray-800",
    attributeTagSelected: "bg-green-100/70 backdrop-blur-sm border-green-400/50 text-green-900",
    attributeCheckbox: "text-green-600",
    attributeIcon: "text-gray-600",
    attributeText: "text-gray-900",
  },
  page: "bg-gradient-to-br from-gray-200 via-gray-200/80 to-green-50/40 text-gray-900",
  hero: {
    wrapper: "bg-green-900",
    overlay: "bg-green-950/5",
    chip: "bg-white/20 backdrop-blur-xl border border-white/20 text-white",
    title: "bg-gradient-to-r from-white via-gray-100 to-green-100",
    subtitle: "text-white",
    statText: "text-white",
    divider: "bg-white/30",
  },
  content: "bg-transparent",
  empty: {
    icon: "bg-gray-100/60 backdrop-blur-sm text-gray-400",
    heading: "text-gray-900",
    text: "text-gray-600",
  },
  card: {
    container: "bg-white/50 backdrop-blur-xl border border-gray-200/40 shadow-xl hover:shadow-2xl hover:bg-white/60 text-gray-900",
    header: "bg-green-900",
    headerOverlay: "bg-green-950/5",
    avatar: "bg-white/80 backdrop-blur-sm shadow-sm",
    avatarFallback: "bg-gray-500 text-white",
    infoText: "text-white",
    category: "text-white/80",
    meta: "text-white/90",
    action: "bg-white/15 backdrop-blur-xl text-white border border-white/20 hover:bg-white/25",
    actionHover: "hover:bg-white/25",
    body: "bg-gray-50/15 backdrop-blur-sm",
    footer: "text-gray-700 border-t border-gray-300/30",
    footerHover: "hover:bg-gray-50/30 backdrop-blur-sm",
  },
  strainCard: {
    container: "bg-white/60 backdrop-blur-xl text-gray-900 hover:bg-gray-50/30 border border-gray-200/30",
    meta: "text-gray-600",
  },
  button: "bg-green-600 hover:bg-green-500 text-white border border-green-500/40 shadow-md hover:shadow-lg",
  toggle: {
    container:
      "bg-white/60 backdrop-blur-xl border border-gray-200/60 shadow-inner shadow-gray-200/30",
    indicator: {
      base:
        "absolute left-1.5 top-1.5 bottom-1.5 rounded-full transform transition-all duration-300 ease-out shadow-lg",
      flower: "bg-gradient-to-r from-green-500 to-green-600 translate-x-0 w-24",
      hash: "bg-gradient-to-r from-green-500 to-green-600 translate-x-24 w-22",
    },
    label: {
      base: "font-semibold text-sm transition-all duration-300 ease-out",
      active: "text-white drop-shadow-sm",
      inactive: "text-gray-600 hover:text-gray-900",
    },
    labelWrapper: {
      flower: "w-24",
      hash: "w-22",
    },
    focusRing: "ring-green-400/30 ring-opacity-0 focus-within:ring-opacity-80",
  },
};

// Dark mode theme for BLACK market
const BLACK_THEME = {
  search: {
    icon: "text-green-600",
    input: "bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 text-zinc-100 placeholder-gray-400/60 hover:border-green-600/50",
    inputFocus: "bg-zinc-900/90 shadow-xl shadow-green-900/30 border-green-500/60",
    filterButton: "text-green-800 hover:text-green-300",
    filterButtonActive: "text-green-200",
    clearButton: "text-gray-400 hover:text-green-300",
    focusRing: "ring-green-500/50",
    panel: "bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 shadow-2xl shadow-gray-900/40",
    attributeTag: "bg-zinc-800/90 border border-zinc-600/60 text-gray-200",
    attributeTagSelected: "bg-green-900/70 border-green-600/60 text-green-100",
    attributeCheckbox: "text-green-400",
    attributeIcon: "text-gray-400",
    attributeText: "text-gray-100",
  },
  page: "bg-gradient-to-br from-zinc-950 to-green-950 text-gray-50",
  hero: {
    wrapper: "bg-green-950",
    overlay: "bg-black/10",
    chip: "bg-white/25 backdrop-blur-sm border border-white/20 text-white",
    title: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-50",
    subtitle: "text-white",
    statText: "text-white",
    divider: "bg-white/30",
  },
  content: "bg-transparent",
  empty: {
    icon: "bg-gray-800/80 text-green-400",
    heading: "text-gray-100",
    text: "text-gray-300",
  },
  card: {
    container: "bg-gray-900/70 backdrop-blur-sm border border-gray-700/40 shadow-xl hover:shadow-2xl text-gray-100",
    header: "bg-green-950",
    headerOverlay: "bg-black/10",
    avatar: "bg-gray-800/80 shadow-md",
    avatarFallback: "bg-gray-600 text-white",
    infoText: "text-white",
    category: "text-white/80",
    meta: "text-white/90",
    action: "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30",
    actionHover: "hover:bg-white/30",
    body: "bg-gray-800/30",
    footer: "text-gray-200 border-t border-gray-600/40",
    footerHover: "hover:bg-gray-800/60",
  },
  strainCard: {
    container: "bg-gray-900/80 backdrop-blur-sm text-gray-100 hover:bg-gray-800/60 border border-gray-700/30",
    meta: "text-gray-200",
  },
  button: "bg-green-600 hover:bg-green-500 text-white border border-green-500/60 shadow-lg hover:shadow-xl",
  toggle: {
    container:
      "bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/70 shadow-inner shadow-black/40",
    indicator: {
      base:
        "absolute left-1.5 top-1.5 bottom-1.5 rounded-full transform transition-all duration-300 ease-out shadow-lg",
      flower: "bg-gradient-to-r from-green-500 to-green-700 translate-x-0 w-24",
      hash: "bg-gradient-to-r from-green-600 to-green-700 translate-x-24 w-22",
    },
    label: {
      base: "font-semibold text-sm transition-all duration-300 ease-out",
      active: "text-white drop-shadow-sm",
      inactive: "text-gray-300 hover:text-white",
    },
    labelWrapper: {
      flower: "w-24",
      hash: "w-22",
    },
    focusRing: "ring-green-500/30 ring-opacity-0 focus-within:ring-opacity-80",
  },
};

const MARKET_THEME: Record<Market, MarketTheme> = {
  WHITE: {
    drops: {
      ...WHITE_THEME,
      search: WHITE_THEME.search,
    },
    rankings: {
      ...WHITE_THEME,
      producerCardAppearance: "light",
      search: WHITE_THEME.search,
    },
  },
  BOTH: {
    drops: {
      ...BOTH_THEME,
      search: BOTH_THEME.search,
    },
    rankings: {
      ...BOTH_THEME,
      producerCardAppearance: "gray",
      search: BOTH_THEME.search,
    },
  },
  BLACK: {
    drops: {
      ...BLACK_THEME,
      search: BLACK_THEME.search,
    },
    rankings: {
      ...BLACK_THEME,
      producerCardAppearance: "dark",
      search: BLACK_THEME.search,
    },
  },
};

export function getMarketTheme(market: Market): MarketTheme {
  return MARKET_THEME[market];
}