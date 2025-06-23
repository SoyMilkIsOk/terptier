// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setProfileId(data.id);
          setIsAdmin(data.role === "ADMIN");
        }
      }
    });
    // listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user?.email) {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setProfileId(data.id);
          setIsAdmin(data.role === "ADMIN");
        } else {
          setProfileId(null);
          setIsAdmin(false);
        }
      } else {
        setProfileId(null);
        setIsAdmin(false);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl hover:opacity-90">
          CO Grower Rank
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" className={`${pathname === "/" ? "underline" : "hover:underline"}`}>Home</Link>

          {profileId && (
            <Link
              href={`/profile/${profileId}`}
              className={`${
                pathname === `/profile/${profileId}` ? "underline" : "hover:underline"
              }`}
            >
              Profile
            </Link>
          )}

          {session && isAdmin && (
            <Link
              href="/admin"
              className={`${pathname === "/admin" ? "underline" : "hover:underline"}`}
            >
              Admin Panel
            </Link>
          )}

          {!session ? (
            <Link
              href="/login"
              className={`${pathname === "/login" ? "underline" : "hover:underline"}`}
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
