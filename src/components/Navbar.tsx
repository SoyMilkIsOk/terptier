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

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 flex items-center h-16">
        <Link href="/" className="font-bold text-xl">
          CO Grower Rank
        </Link>
        <div className="ml-auto space-x-4">
          <Link href="/" className={pathname === "/" ? "underline" : ""}>
            Home
          </Link>

          {session?.user && session.user.email && ( // Ensure email exists
            <Link
              href={`/profile/${encodeURIComponent(session.user.email)}`}
              className={pathname === `/profile/${encodeURIComponent(session.user.email)}` ? "underline" : ""}
            >
              Profile
            </Link>
          )}

          {session && (
            <Link
              href="/admin"
              className={pathname === "/admin" ? "underline" : ""}
            >
              Admin
            </Link>
          )}

          {!session ? (
            <Link
              href="/login"
              className={pathname === "/login" ? "underline" : ""}
            >
              Log In
            </Link>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
              }}
              className="underline"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
