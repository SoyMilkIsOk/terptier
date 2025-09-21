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

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label="Select market focus"
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm"
      >
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
              className={`flex items-center justify-center rounded-full px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 ${
                isActive
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { isMarket };
