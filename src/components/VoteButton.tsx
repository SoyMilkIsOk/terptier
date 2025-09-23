"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useStateSlug } from "./StateProvider";

export default function VoteButton({
  producerId,
  initialAverage,
  userRating,
  readOnly = false,
  navigateOnClick = false,
  showNumber = false,
  linkSlug,
  compact = false,
}: {
  producerId: string;
  initialAverage: number;
  userRating: number | null | undefined;
  readOnly?: boolean;
  navigateOnClick?: boolean;
  showNumber?: boolean;
  linkSlug?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const stateSlug = useStateSlug();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rating, setRating] = useState(userRating ?? 0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (readOnly) return;
    let isMounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isMounted) {
          return;
        }
        setCurrentUser(user ?? null);
      } catch (err) {
        console.error("Failed to verify Supabase user", err);
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      await loadUser();
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [readOnly]);

  const cast = async (val: number) => {
    if (readOnly) {
      if (navigateOnClick) {
        router.push(`/${stateSlug}/producer/${linkSlug ?? producerId}`);
      }
      return;
    }

    if (!currentUser?.id) {
      router.push("/login?reason=vote_redirect");
      return;
    }

    setRating(val);
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, value: val, stateSlug }),
    });
    if (res.ok) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
    router.refresh();
  };

  return (
    <div
      className={`relative flex items-center ${compact ? "space-x-0.5" : "space-x-1"}`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const display = readOnly ? initialAverage : rating;
        const fraction = Math.max(0, Math.min(display - (n - 1), 1));
        return (
          <button
            key={n}
            onClick={() => cast(n)}
            className={`p-0.5 ${!readOnly || navigateOnClick ? "cursor-pointer" : ""}`}
          >
            <div className={`relative ${compact ? "w-4 h-4" : "w-5 h-5"}`}>
              <Star className={`absolute ${compact ? "w-4 h-4" : "w-5 h-5"} text-gray-400`} />
              <div
                className="absolute overflow-hidden top-0 left-0"
                style={{ width: `${fraction * 100}%` }}
              >
                <Star className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-yellow-400 fill-yellow-400`} />
              </div>
            </div>
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 text-sm text-gray-700">
          {initialAverage.toFixed(1)}
        </span>
      )}
      {showTooltip && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg"
        >
          Vote submitted!
        </div>
      )}
    </div>
  );
}

