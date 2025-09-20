// src/components/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { LogIn, LogOut, UserPlus, ChevronDown, User, Shield, Calendar, Crown } from "lucide-react";
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

type CurrentUserResponse = {
  success: boolean;
  id: string;
  role: string;
  username?: string | null;
  profilePicUrl?: string | null;
  notificationOptIn: boolean;
  adminStates?: { slug: string }[];
  adminProducers?: string[];
  isGlobalAdmin?: boolean;
  isStateAdmin?: boolean;
  isProducerAdmin?: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [adminStateSlugs, setAdminStateSlugs] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [notificationOptIn, setNotificationOptIn] = useState(true);
  const [showDropModal, setShowDropModal] = useState(false);
  const [states, setStates] = useState<StateOption[]>([DEFAULT_STATE]);
  const [selectedState, setSelectedState] = useState(DEFAULT_STATE_SLUG);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
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
  const adminPath = useMemo(
    () => `/${selectedState}/admin`,
    [selectedState],
  );

  const selectedStateData = useMemo(
    () => states.find(state => state.slug === selectedState) || states[0],
    [states, selectedState]
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    persistSelectedState(newState);
    setStateDropdownOpen(false);
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

  const applyUserResponse = useCallback((data: CurrentUserResponse | null) => {
    if (!data || !data.success) {
      setProfileUsername(null);
      setIsGlobalAdmin(false);
      setAdminStateSlugs([]);
      setNotificationOptIn(true);
      setShowDropModal(false);
      setIsAdmin(false);
      return;
    }

    setProfileUsername(data.username || data.id);
    setNotificationOptIn(data.notificationOptIn);
    const adminSlugs = Array.isArray(data.adminStates)
      ? data.adminStates
          .map((state) => state?.slug)
          .filter((slug): slug is string => Boolean(slug))
      : [];
    const nextIsGlobalAdmin = data.isGlobalAdmin ?? data.role === "ADMIN";
    setIsGlobalAdmin(nextIsGlobalAdmin);
    setAdminStateSlugs(adminSlugs);

    if (
      !data.notificationOptIn &&
      typeof document !== "undefined" &&
      !document.cookie.includes("dropOptInPrompt=")
    ) {
      setShowDropModal(true);
    } else {
      setShowDropModal(false);
    }
  }, []);

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/users/me");
          if (res.ok) {
            const data: CurrentUserResponse = await res.json();
            applyUserResponse(data.success ? data : null);
          } else {
            applyUserResponse(null);
          }
        } catch (err) {
          console.error("Failed to fetch user", err);
          applyUserResponse(null);
        }
      } else {
        applyUserResponse(null);
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
              const data: CurrentUserResponse = await res.json();
              applyUserResponse(data.success ? data : null);
            } else {
              applyUserResponse(null);
            }
          } catch (err) {
            console.error("Failed to fetch user", err);
            applyUserResponse(null);
          }
        } else {
          applyUserResponse(null);
        }
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [applyUserResponse]);

  useEffect(() => {
    setIsAdmin(isGlobalAdmin || adminStateSlugs.includes(selectedState));
  }, [isGlobalAdmin, adminStateSlugs, selectedState]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY.current || currentY <= 50) {
        setShowBar(true);
      } else if (currentY > lastScrollY.current) {
        setShowBar(false);
        setMenuOpen(false);
        setStateDropdownOpen(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setStateDropdownOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setStateDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: showBar ? 0 : -80 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        className="bg-gradient-to-r from-green-900/95 via-green-800/95 to-green-700/95 backdrop-blur-lg border-b border-white/10 text-white shadow-2xl fixed top-0 left-0 right-0 z-50"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-200">
            <Image
              src="/TerpTier.svg"
              alt="TerpTier logo"
              className="ml-4"
              width={60}
              height={50}
            />
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden mr-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:outline-none hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                    menuOpen ? "rotate-45 top-1/2 -translate-y-1/2" : "top-1.5"
                  }`}
                />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                    menuOpen ? "opacity-0" : "top-1/2 -translate-y-1/2"
                  }`}
                />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                    menuOpen ? "-rotate-45 top-1/2 -translate-y-1/2" : "bottom-1.5"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* State Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 hover:bg-white/20 transition-all duration-200 group"
              >
                <span className="text-sm font-medium">{selectedStateData?.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {stateDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-0 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {states.map((state, index) => (
                        <motion.button
                          key={state.slug}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleStateChange(state.slug)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-green-800 hover:bg-green-50/80 transition-all duration-200 ${
                            selectedState === state.slug ? 'bg-green-100/80 font-semibold' : ''
                          }`}
                        >
                          {state.name}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <Link
              href={dropsPath}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                pathname?.startsWith(dropsPath)
                  ? "bg-white/20 backdrop-blur-sm"
                  : "hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Drops</span>
            </Link>
            <Link
              href={rankingsPath}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                pathname?.startsWith(rankingsPath)
                  ? "bg-white/20 backdrop-blur-sm"
                  : "hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Rankings</span>
            </Link>

            {profileUsername && (
              <Link
                href={`/profile/${profileUsername}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  pathname === `/profile/${profileUsername}`
                    ? "bg-white/20 backdrop-blur-sm"
                    : "hover:bg-white/10 backdrop-blur-sm"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            )}

            {session && isAdmin && (
              <Link
                href={adminPath}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  pathname?.startsWith(adminPath)
                    ? "bg-white/20 backdrop-blur-sm"
                    : "hover:bg-white/10 backdrop-blur-sm"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Auth Buttons */}
            {!session ? (
              <Link
                href="/login"
                className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm text-green-800 px-6 py-2.5 rounded-2xl font-medium hover:bg-white/100 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setSession(null);
                  location.reload();
                }}
                className="flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm hover:bg-red-600/90 px-6 py-2.5 rounded-2xl font-medium cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-white">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-gradient-to-b from-green-800/95 to-green-900/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="px-6 py-6 space-y-4">
                {/* Mobile State Selector */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wide text-green-200 font-medium">
                    State
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white/95 backdrop-blur-sm text-green-800 rounded-2xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none font-medium shadow-lg"
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
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2 pt-4">
                  <Link
                    href={dropsPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-200 font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Drops</span>
                  </Link>
                  <Link
                    href={rankingsPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-200 font-medium"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Rankings</span>
                  </Link>
                  {profileUsername && (
                    <Link
                      href={`/profile/${profileUsername}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-200 font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  )}
                  {session && isAdmin && (
                    <Link
                      href={adminPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-200 font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 space-y-3">
                  {!session ? (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-white/95 backdrop-blur-sm text-green-800 rounded-2xl font-medium shadow-lg"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setSession(null);
                        setMenuOpen(false);
                        location.reload();
                      }}
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-red-500/90 backdrop-blur-sm hover:bg-red-600/90 rounded-2xl font-medium cursor-pointer text-white shadow-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
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