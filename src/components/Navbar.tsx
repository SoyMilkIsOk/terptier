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
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async (sess: Session | null) => {
      if (sess?.user?.email) {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setSession(sess);
          setProfileId(data.id);
          setIsAdmin(data.role === "ADMIN");
        } else {
          await supabase.auth.signOut();
          setSession(null);
          setProfileId(null);
          setIsAdmin(false);
        }
      } else {
        setSession(null);
        setProfileId(null);
        setIsAdmin(false);
      }
    };

    // fetch initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => checkSession(session));
    // listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        await checkSession(sess);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-green-700 text-white shadow-md">
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
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className={`${pathname === "/" ? "underline" : "hover:underline"}`}
          >
            Home
          </Link>

          {profileId && (
            <Link
              href={`/profile/${profileId}`}
              className={`${
                pathname === `/profile/${profileId}`
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
    </nav>
  );
}
