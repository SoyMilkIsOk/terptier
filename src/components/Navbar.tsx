// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
              } else {
                setProfileUsername(null);
                setIsAdmin(false);
              }
            } else {
              setProfileUsername(null);
              setIsAdmin(false);
            }
          } catch (err) {
            console.error("Failed to fetch user", err);
            setProfileUsername(null);
            setIsAdmin(false);
          }
        } else {
          setProfileUsername(null);
          setIsAdmin(false);
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-green-700 text-white shadow-md relative">
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
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden"
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-8 h-8 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute left-1/2 w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${menuOpen ? "rotate-45 top-3.5" : "top-2"}`}
              style={{ transformOrigin: "center" }}
            />
            <span
              className={`absolute left-1/2 w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${menuOpen ? "-rotate-45 top-3.5" : "top-5"}`}
              style={{ transformOrigin: "center" }}
            />
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`${pathname === "/" ? "underline" : "hover:underline"}`}
          >
            Home
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
            <Link
              href="/login"
              className={`${
                pathname === "/login" ? "underline" : "hover:underline"
              }`}
            >
              Log In / Sign Up
            </Link>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
              }}
              className="hover:underline"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-green-700 pt-4 pb-6 space-y-4 flex flex-col items-center text-white">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-1"
          >
            Home
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
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-1"
            >
              Log In / Sign Up
            </Link>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
                setMenuOpen(false);
              }}
              className="w-full py-1 text-center"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
