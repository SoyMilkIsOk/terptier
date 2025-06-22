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

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setProfileId(data.id);
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
        } else {
          setProfileId(null);
        }
      } else {
        setProfileId(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 flex items-center h-16">
        <Link href="/" className="font-bold text-xl cursor-pointer">
          CO Grower Rank
        </Link>
        <div className="ml-auto space-x-4">
          <Link href="/" className={`${pathname === "/" ? "underline" : ""} cursor-pointer`}>
            Home
          </Link>

          {profileId && (
            <Link
              href={`/profile/${profileId}`}
              className={`${pathname === `/profile/${profileId}` ? "underline" : ""} cursor-pointer`}
            >
              Profile
            </Link>
          )}

          {session && (
            <Link
              href="/admin"
              className={`${pathname === "/admin" ? "underline" : ""} cursor-pointer`}
            >
              Admin
            </Link>
          )}

          {!session ? (
            <Link
              href="/login"
              className={`${pathname === "/login" ? "underline" : ""} cursor-pointer`}
            >
              Log In
            </Link>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
              }}
              className="underline cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
