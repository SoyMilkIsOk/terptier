"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function VoteButton({
  producerId,
  initialAverage,
  userRating,
  readOnly = false,
}: {
  producerId: string;
  initialAverage: number;
  userRating: number | null | undefined;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(userRating ?? 0);

  useEffect(() => {
    if (readOnly) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) =>
      setSession(sess)
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [readOnly]);

  const cast = async (val: number) => {
    if (readOnly) {
      router.push(`/producer/${producerId}`);
      return;
    }

    if (!session?.user.id) {
      router.push("/login?reason=vote_redirect");
      return;
    }

    setRating(val);
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, value: val }),
    });
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const display = readOnly ? Math.round(initialAverage) : rating;
        return (
          <button key={n} onClick={() => cast(n)} className="p-0.5">
            <Star
              className={`w-5 h-5 ${
                n <= display ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-700">
        {initialAverage.toFixed(1)}
      </span>
    </div>
  );
}

