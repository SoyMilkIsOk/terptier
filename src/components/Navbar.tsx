// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // fetch initial session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      if (user?.email) {
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
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user?.email) {
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
          <Link
            href="/rankings"
            className={`${
              pathname === "/rankings" ? "underline" : "hover:underline"
            }`}
          >
            Brands
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

          {currentUser && isAdmin && (
            <Link
              href="/admin"
              className={`${
                pathname === "/admin" ? "underline" : "hover:underline"
              }`}
            >
              Admin Panel
            </Link>
          )}

          {!currentUser ? (
            <Link
              href="/login"
              className="flex items-center space-x-1 bg-white text-green-700 px-3 py-1 rounded-full hover:bg-green-50"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In / Sign Up</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                await supabase.auth.signOut();
                setCurrentUser(null);
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
      {menuOpen && (
        <div className="md:hidden bg-green-800 border-t border-b border-green-900 pt-4 pb-6 space-y-4 flex flex-col items-center text-white">
          <Link
            href="/rankings"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-1"
          >
            Brands
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
          {currentUser && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-1"
            >
              Admin Panel
            </Link>
          )}
          {!currentUser ? (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center py-1 px-3 bg-white text-green-700 rounded-full flex items-center justify-center space-x-1"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In / Sign Up</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                await supabase.auth.signOut();
                setCurrentUser(null);
                setMenuOpen(false);
                location.reload();
              }}
              className="text-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full cursor-pointer text-white flex items-center justify-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
