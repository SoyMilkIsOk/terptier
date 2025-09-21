"use client";

import { useCallback, useRef } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { Market } from "@prisma/client";
import type { KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Moon, Sun, CircleDot } from "lucide-react";

const STORAGE_KEY = "terptier:market";

const MARKET_OPTIONS: {
  value: Market;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "WHITE", label: "White market", icon: Sun },
  { value: "BOTH", label: "Both markets", icon: CircleDot },
  { value: "BLACK", label: "Black market", icon: Moon },
];

type MarketModeToggleProps = {
  value: Market;
  onChange?: (market: Market) => void;
  className?: string;
  /**
   * Persist the last selected market in localStorage so it can be restored later.
   * Disabled by default so callers can opt-in based on product requirements.
   */
  persistSelection?: boolean;
  /**
   * Override the localStorage key used when persisting the selection.
   */
  storageKey?: string;
};

function isMarket(value: string): value is Market {
  return MARKET_OPTIONS.some((option) => option.value === value);
}

export default function MarketModeToggle({
  value,
  onChange,
  className,
  persistSelection = false,
  storageKey = STORAGE_KEY,
}: MarketModeToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateQueryParam = useCallback(
    (nextValue: Market) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("market", nextValue);
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      router.replace(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSelect = useCallback(
    (nextValue: Market) => {
      if (nextValue === value) return;

      onChange?.(nextValue);
      updateQueryParam(nextValue);

      if (persistSelection && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, nextValue);
        } catch (error) {
          console.error("Failed to persist market selection", error);
        }
      }
    },
    [onChange, persistSelection, storageKey, updateQueryParam, value],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const { key } = event;
      if (key !== "ArrowRight" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      const offset = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + offset + MARKET_OPTIONS.length) % MARKET_OPTIONS.length;
      const nextOption = MARKET_OPTIONS[nextIndex];
      handleSelect(nextOption.value);
      buttonRefs.current[nextIndex]?.focus();
    },
    [handleSelect],
  );

  const activeIndex = MARKET_OPTIONS.findIndex(option => option.value === value);

  // Dynamic color schemes based on market type
  const getColorScheme = () => {
    switch (value) {
      case "WHITE":
        return {
          track: "bg-gradient-to-b from-zinc-50/90 to-zinc-100/95",
          trackBorder: "border-zinc-200/40",
          sliderBg: "linear-gradient(145deg, rgba(34, 197, 94, 0.85), rgba(22, 163, 74, 0.9))",
          sliderShadow: "0 2px 6px rgba(34, 197, 94, 0.25), 0 1px 2px rgba(0,0,0,0.08)",
          innerTrack: "bg-gradient-to-b from-white/60 to-zinc-50/40",
        };
      case "BOTH":
        return {
          track: "bg-gradient-to-b from-zinc-200/80 to-zinc-300/90",
          trackBorder: "border-zinc-400/30",
          sliderBg: "linear-gradient(145deg, rgba(34, 197, 94, 0.85), rgba(22, 163, 74, 0.9))",
          sliderShadow: "0 2px 6px rgba(34, 197, 94, 0.25), 0 1px 2px rgba(0,0,0,0.12)",
          innerTrack: "bg-gradient-to-b from-zinc-100/50 to-zinc-200/40",
        };
      case "BLACK":
        return {
          track: "bg-gradient-to-b from-zinc-700/90 to-zinc-800/95",
          trackBorder: "border-zinc-600/40",
          sliderBg: "linear-gradient(145deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.95))",
          sliderShadow: "0 2px 8px rgba(34, 197, 94, 0.4), 0 1px 2px rgba(0,0,0,0.2)",
          innerTrack: "bg-gradient-to-b from-zinc-600/40 to-zinc-700/30",
        };
      default:
        return {
          track: "bg-gradient-to-b from-zinc-100/80 to-zinc-200/90",
          trackBorder: "border-zinc-300/30",
          sliderBg: "linear-gradient(145deg, rgba(34, 197, 94, 0.85), rgba(22, 163, 74, 0.9))",
          sliderShadow: "0 2px 6px rgba(34, 197, 94, 0.25), 0 1px 2px rgba(0,0,0,0.1)",
          innerTrack: "bg-gradient-to-b from-zinc-50/50 to-white/30",
        };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label="Select market focus"
        className={`relative inline-flex items-center rounded-full backdrop-blur-sm border p-1 shadow-inner transition-all duration-300 ${colorScheme.track} ${colorScheme.trackBorder}`}
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        {/* Glass slider track - recessed look */}
        <div className={`absolute inset-1 rounded-full shadow-inner transition-all duration-300 ${colorScheme.innerTrack}`}>
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        
        {/* Sliding glass toggle */}
        <div 
          className="absolute z-20 w-12 h-12 rounded-full transition-all duration-300 ease-out transform"
          style={{
            left: `${4 + activeIndex * 48}px`,
            background: colorScheme.sliderBg,
            boxShadow: `${colorScheme.sliderShadow}, inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)`
          }}
        >
          {/* Subtle inner glass highlight */}
          <div 
            className="absolute top-1.5 left-1.5 w-8 h-4 rounded-full opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6), transparent)'
            }}
          />
          
          {/* Minimal glass shine effect */}
          <div 
            className="absolute top-1 left-2.5 w-4 h-2 rounded-full opacity-15"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8), transparent)'
            }}
          />
        </div>
        
        {MARKET_OPTIONS.map((option, index) => {
          const isActive = option.value === value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`relative z-30 flex items-center justify-center w-12 h-12 rounded-full text-sm font-medium transition-all duration-200 ease-out group ${
                isActive
                  ? "text-white drop-shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 focus-visible:ring-offset-transparent`}
            >
              <Icon 
                aria-hidden="true" 
                className={`h-5 w-5 transition-all duration-200 ${
                  isActive 
                    ? "drop-shadow-sm scale-105" 
                    : "group-hover:scale-110"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { isMarket };