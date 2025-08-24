// src/components/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import DropOptInModal from "./DropOptInModal";

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [_isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [notificationOptIn, setNotificationOptIn] = useState(true);
  const [showDropModal, setShowDropModal] = useState(false);
  const lastScrollY = useRef(0);
  const [exploreMobileOpen, setExploreMobileOpen] = useState(false);
  const [profileMobileOpen, setProfileMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setExploreMobileOpen(false);
    setProfileMobileOpen(false);
    setExploreOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    // fetch initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
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
              if (!data.notificationOptIn && !document.cookie.includes('dropOptInPrompt=')) {
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
                if (!data.notificationOptIn && !document.cookie.includes('dropOptInPrompt=')) {
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
      }
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
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: showBar ? 0 : -80 }}
      transition={{ type: "tween", duration: 0.3 }}
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
        <div className="flex md:hidden items-center space-x-4 mr-4">
          <button
            onClick={() => {
              const newState = !menuOpen;
              setMenuOpen(newState);
              if (newState) {
                setExploreMobileOpen(false);
                setProfileMobileOpen(false);
              }
            }}
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
          {profileUsername ? (
            <div className="relative">
              <button
                onClick={() => {
                  const newState = !profileMobileOpen;
                  setProfileMobileOpen(newState);
                  if (newState) {
                    setMenuOpen(false);
                    setExploreMobileOpen(false);
                  }
                }}
                aria-label="Profile menu"
              >
                <UserCircle className="w-8 h-8" />
              </button>
              {profileMobileOpen && (
                <div className="absolute right-0 mt-2 bg-green-600 text-white rounded shadow-lg">
                  <Link
                    href={`/profile/${profileUsername}`}
                    onClick={closeAllMenus}
                    className="block px-5 py-3 text-center whitespace-nowrap"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setSession(null);
                      closeAllMenus();
                      location.reload();
                    }}
                    className="w-full flex items-center justify-center space-x-1 px-5 py-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" aria-label="Log in">
              <LogIn className="w-8 h-8" />
            </Link>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/about"
            onClick={closeAllMenus}
            className={`${pathname === "/about" ? "underline" : "hover:underline"}`}
          >
            About
          </Link>

          <div
            className="relative"
            onMouseEnter={() => {
              setExploreOpen(true);
              setProfileOpen(false);
            }}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button
              onClick={() => {
                setExploreOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className={`${
                pathname === "/rankings" || pathname === "/drops"
                  ? "underline"
                  : "hover:underline"
              }`}
            >
              Explore
            </button>
            {exploreOpen && (
              <div className="absolute left-0 mt-2 bg-green-600 text-white rounded shadow-lg">
                <Link
                  href="/rankings"
                  onClick={closeAllMenus}
                  className="block px-5 py-3 hover:bg-green-500 whitespace-nowrap"
                >
                  Brands
                </Link>
                <Link
                  href="/drops"
                  onClick={closeAllMenus}
                  className="block px-5 py-3 hover:bg-green-500 whitespace-nowrap"
                >
                  Drops
                </Link>
              </div>
            )}
          </div>

          {profileUsername ? (
            <div
              className="relative"
              onMouseEnter={() => {
                setProfileOpen(true);
                setExploreOpen(false);
              }}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setExploreOpen(false);
                }}
                className="flex items-center"
              >
                <UserCircle className="w-5 h-5" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 bg-green-600 text-white rounded shadow-lg">
                  <Link
                    href={`/profile/${profileUsername}`}
                    onClick={closeAllMenus}
                    className="block px-5 py-3 hover:bg-green-500 whitespace-nowrap"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setSession(null);
                      closeAllMenus();
                      location.reload();
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-green-500 flex items-center space-x-2 whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex items-center">
              <LogIn className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-green-700 border-t border-b border-green-900 pt-4 pb-6 space-y-4 flex flex-col items-center text-white">
          <Link
            href="/about"
            onClick={closeAllMenus}
            className="w-full text-center py-1"
          >
            About
          </Link>
          <div className="w-full">
            <button
              onClick={() => setExploreMobileOpen(!exploreMobileOpen)}
              className="w-full text-center py-1"
            >
              Explore
            </button>
            {exploreMobileOpen && (
              <div className="bg-green-600">
                <Link
                  href="/rankings"
                  onClick={closeAllMenus}
                  className="block text-center py-1"
                >
                  Brands
                </Link>
                <Link
                  href="/drops"
                  onClick={closeAllMenus}
                  className="block text-center py-1"
                >
                  Drops
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
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
