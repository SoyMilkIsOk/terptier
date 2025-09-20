// src/components/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import DropOptInModal from "./DropOptInModal";
import { DEFAULT_STATE, DEFAULT_STATE_SLUG } from "@/lib/stateConstants";

const STATE_STORAGE_KEY = "terptier:selectedState";
const STATE_COOKIE_NAME = "preferredState";

type StateOption = {
  slug: string;
  name: string;
  abbreviation: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [notificationOptIn, setNotificationOptIn] = useState(true);
  const [showDropModal, setShowDropModal] = useState(false);
  const [states, setStates] = useState<StateOption[]>([DEFAULT_STATE]);
  const [selectedState, setSelectedState] = useState(DEFAULT_STATE_SLUG);
  const lastScrollY = useRef(0);

  const slugSet = useMemo(
    () => new Set(states.map((state) => state.slug)),
    [states],
  );

  const getStateSlugFromPath = useCallback(
    (currentPath: string | null): string | null => {
      if (!currentPath) {
        return null;
      }

      const match = currentPath.match(/^\/([^/]+)(?:\/|$)/);
      if (!match) {
        return null;
      }

      const slug = match[1];
      if (!slugSet.size || slugSet.has(slug)) {
        return slug;
      }

      return null;
    },
    [slugSet],
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

  const dropsPath = useMemo(
    () => `/${selectedState}/drops`,
    [selectedState],
  );
  const rankingsPath = useMemo(
    () => `/${selectedState}/rankings`,
    [selectedState],
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    persistSelectedState(newState);
    router.push("/");
  };

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

    const slugFromPath = getStateSlugFromPath(pathname);
    if (slugFromPath) {
      setSelectedState(slugFromPath);
      persistSelectedState(slugFromPath);
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
      setSelectedState(cookieState);
      persistSelectedState(cookieState);
      return;
    }

    const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (stored && (!slugSet.size || slugSet.has(stored))) {
      setSelectedState(stored);
    } else {
      setSelectedState(DEFAULT_STATE_SLUG);
    }
  }, [pathname, slugSet, getStateSlugFromPath, persistSelectedState]);

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/users/me");
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setProfileUsername(data.username || data.id);
              setIsAdmin(data.role === "ADMIN");
              setNotificationOptIn(data.notificationOptIn);
              if (
                !data.notificationOptIn &&
                !document.cookie.includes("dropOptInPrompt=")
              ) {
                setShowDropModal(true);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch user", err);
        }
      }
    });
    // listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        if (sess?.user?.email) {
          try {
            const res = await fetch("/api/users/me");
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                setProfileUsername(data.username || data.id);
                setIsAdmin(data.role === "ADMIN");
                setNotificationOptIn(data.notificationOptIn);
                if (
                  !data.notificationOptIn &&
                  !document.cookie.includes("dropOptInPrompt=")
                ) {
                  setShowDropModal(true);
                } else {
                  setShowDropModal(false);
                }
              } else {
                setProfileUsername(null);
                setIsAdmin(false);
                setNotificationOptIn(true);
                setShowDropModal(false);
              }
            } else {
              setProfileUsername(null);
              setIsAdmin(false);
              setNotificationOptIn(true);
              setShowDropModal(false);
            }
          } catch (err) {
            console.error("Failed to fetch user", err);
            setProfileUsername(null);
            setIsAdmin(false);
            setNotificationOptIn(true);
            setShowDropModal(false);
          }
        } else {
          setProfileUsername(null);
          setIsAdmin(false);
          setNotificationOptIn(true);
          setShowDropModal(false);
        }
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY.current || currentY <= 50) {
        setShowBar(true);
      } else if (currentY > lastScrollY.current) {
        setShowBar(false);
        setMenuOpen(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: showBar ? 0 : -80 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        className="bg-green-700 text-white shadow-md fixed top-0 left-0 right-0 z-50"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center hover:opacity-90">
            <Image
              src="/TerpTier.svg"
              alt="TerpTier logo"
              className="ml-4"
              width={60}
              height={50}
            />
          </Link>
          <div className="flex md:hidden mr-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-8 h-8 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`absolute left-1/2 w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                  menuOpen ? "rotate-45 top-2.5" : "top-2"
                }`}
                style={{ transformOrigin: "center" }}
              />
              <span
                className={`absolute left-1/2 w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                  menuOpen ? "-rotate-45 top-2.5" : "top-5"
                }`}
                style={{ transformOrigin: "center" }}
              />
            </button>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 md:hidden"></div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label htmlFor="state-select" className="text-sm text-green-100">
                State
              </label>
              <select
                id="state-select"
                className="bg-white text-green-700 text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
                value={selectedState}
                onChange={(event) => handleStateChange(event.target.value)}
              >
                {states.map((state) => (
                  <option key={state.slug} value={state.slug}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href={dropsPath}
              className={`${
                pathname?.startsWith(dropsPath)
                  ? "underline"
                  : "hover:underline"
              }`}
            >
              Drops
            </Link>
            <Link
              href={rankingsPath}
              className={`${
                pathname?.startsWith(rankingsPath)
                  ? "underline"
                  : "hover:underline"
              }`}
            >
              Rankings
            </Link>

            {profileUsername && (
              <Link
                href={`/profile/${profileUsername}`}
                className={`${
                  pathname === `/profile/${profileUsername}`
                    ? "underline"
                    : "hover:underline"
                }`}
              >
                Profile
              </Link>
            )}

            {session && isAdmin && (
              <Link
                href="/admin"
                className={`${
                  pathname === "/admin" ? "underline" : "hover:underline"
                }`}
              >
                Admin Panel
              </Link>
            )}

            {!session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center space-x-1 bg-white text-green-700 px-3 py-1 rounded-full hover:bg-green-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-1 bg-white/10 text-white px-3 py-1 rounded-full border border-white/30 hover:bg-white/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setSession(null);
                  location.reload();
                }}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-white">Sign Out</span>
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-green-800 border-t border-b border-green-900 pt-4 pb-6 space-y-4 flex flex-col items-center text-white"
            >
              <div className="w-full px-6">
                <label htmlFor="mobile-state-select" className="block text-xs uppercase tracking-wide text-green-200 mb-1">
                  State
                </label>
                <select
                  id="mobile-state-select"
                  className="w-full bg-white text-green-700 text-sm rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={selectedState}
                  onChange={(event) => {
                    handleStateChange(event.target.value);
                    setMenuOpen(false);
                  }}
                >
                  {states.map((state) => (
                    <option key={state.slug} value={state.slug}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={dropsPath}
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-1"
              >
                Drops
              </Link>
              <Link
                href={rankingsPath}
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-1"
              >
                Rankings
              </Link>
              {profileUsername && (
                <Link
                  href={`/profile/${profileUsername}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-1"
                >
                  Profile
                </Link>
              )}
              {session && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-1"
                >
                  Admin Panel
                </Link>
              )}
              {!session ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2 bg-white text-green-700 rounded-full"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2 bg-white/10 border border-white/30 rounded-full"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                    setMenuOpen(false);
                    location.reload();
                  }}
                  className="text-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full cursor-pointer text-white flex items-center justify-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {showDropModal && (
        <DropOptInModal
          onOptIn={() => setNotificationOptIn(true)}
          onClose={() => setShowDropModal(false)}
        />
      )}
    </>
  );
}
