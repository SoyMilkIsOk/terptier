"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DEFAULT_STATE } from "@/lib/stateConstants";

type StateOption = {
  slug: string;
  name: string;
  abbreviation: string;
};

type StateSelectorProps = {
  className?: string;
  preserveParams?: string[];
  label?: string;
};

const STATE_STORAGE_KEY = "terptier:selectedState";
const STATE_COOKIE_NAME = "preferredState";

const KNOWN_SECTIONS = new Set(["drops", "rankings", "admin"]);

export default function StateSelector({
  className = "",
  label,
  preserveParams = ["market", "view"],
}: StateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [states, setStates] = useState<StateOption[]>([DEFAULT_STATE]);
  const pathnameSlug = useMemo(() => {
    if (!pathname) {
      return null;
    }

    const match = pathname.match(/^\/([^/]+)(?:\/|$)/);
    return match ? match[1] : null;
  }, [pathname]);
  const [fallbackState, setFallbackState] = useState<string | null>(
    () => pathnameSlug ?? null,
  );
  const [open, setOpen] = useState(false);

  const slugSet = useMemo(() => new Set(states.map((state) => state.slug)), [states]);
  const selectedState = pathnameSlug ?? fallbackState;

  const preservedQueryString = useMemo(() => {
    const params = new URLSearchParams();

    preserveParams.forEach((param) => {
      const value = searchParams?.get(param);
      if (value) {
        params.set(param, value);
      }
    });

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [preserveParams, searchParams]);

  const applyPreservedQuery = useCallback(
    (targetPath: string) =>
      preservedQueryString ? `${targetPath}${preservedQueryString}` : targetPath,
    [preservedQueryString],
  );

  const persistSelectedState = useCallback((slug: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STATE_STORAGE_KEY, slug);

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${STATE_COOKIE_NAME}=${slug};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }, []);

  const selectedStateData = useMemo(() => {
    if (!selectedState) {
      return null;
    }

    return states.find((state) => state.slug === selectedState) ?? null;
  }, [selectedState, states]);

  const formatStateSlug = useCallback((slug: string | null) => {
    if (!slug) {
      return null;
    }

    return slug
      .split("-")
      .filter(Boolean)
      .map((segment) =>
        segment.length <= 2
          ? segment.toUpperCase()
          : segment.charAt(0).toUpperCase() + segment.slice(1),
      )
      .join(" ");
  }, []);

  const selectedStateLabel =
    selectedStateData?.name ?? formatStateSlug(selectedState) ?? "---";

  const handleStateChange = useCallback(
    (newState: string) => {
      setFallbackState(newState);
      persistSelectedState(newState);
      setOpen(false);

      const currentPath = pathname ?? "/";
      const segments = currentPath.split("/").filter(Boolean);

      if (!segments.length) {
        router.refresh();
        return;
      }

      const [first, ...rest] = segments;
      const isStatePath = slugSet.has(first);

      if (isStatePath) {
        const [section, ...tail] = rest;
        if (section && KNOWN_SECTIONS.has(section)) {
          const suffix = tail.length ? `/${tail.join("/")}` : "";
          router.push(applyPreservedQuery(`/${newState}/${section}${suffix}`));
          return;
        }

        router.push(applyPreservedQuery(`/${newState}`));
        return;
      }

      if (KNOWN_SECTIONS.has(first)) {
        const suffix = rest.length ? `/${rest.join("/")}` : "";
        router.push(applyPreservedQuery(`/${newState}/${first}${suffix}`));
        return;
      }

      router.push(applyPreservedQuery(`/${newState}`));
    },
    [applyPreservedQuery, pathname, persistSelectedState, router, slugSet],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/states");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          success: boolean;
          states?: StateOption[];
        };
        if (!cancelled && data.success && data.states?.length) {
          setStates(data.states);
        }
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (pathnameSlug) {
      setFallbackState(pathnameSlug);
      persistSelectedState(pathnameSlug);
      return;
    }

    const getCookieValue = (name: string) => {
      const cookies = document.cookie ? document.cookie.split(";") : [];
      for (const cookie of cookies) {
        const [key, ...rest] = cookie.trim().split("=");
        if (key === name) {
          return decodeURIComponent(rest.join("="));
        }
      }
      return null;
    };

    const cookieState = getCookieValue(STATE_COOKIE_NAME);
    if (cookieState && (!slugSet.size || slugSet.has(cookieState))) {
      setFallbackState(cookieState);
      persistSelectedState(cookieState);
      return;
    }

    const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (stored && (!slugSet.size || slugSet.has(stored))) {
      setFallbackState(stored);
    } else {
      setFallbackState(null);
    }
  }, [pathnameSlug, persistSelectedState, slugSet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) {
        return;
      }
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={`w-full max-w-xs sm:max-w-sm ${className}`} ref={dropdownRef}>
      {label ? (
        <span className="mb-2 block text-center text-xs uppercase tracking-wide text-white/70">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white/20"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{selectedStateLabel}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 z-50 mt-2 max-h-[40vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/95 text-green-900 shadow-2xl backdrop-blur-lg"
              role="listbox"
            >
              {states.map((state) => (
                <li key={state.slug}>
                  <button
                    type="button"
                    onClick={() => handleStateChange(state.slug)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                      selectedState === state.slug
                        ? "bg-green-100/80 font-semibold text-green-900"
                        : "hover:bg-green-50/80"
                    }`}
                    role="option"
                    aria-selected={selectedState === state.slug}
                  >
                    <span>{state.name}</span>
                    <span className="text-xs uppercase tracking-wide text-green-600">
                      {state.abbreviation}
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
