// src/components/VoteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function VoteButton({
  producerId,
  initial,
  userVote,
}: {
  producerId: string;
  initial: number;
  userVote: number | null;
}) {
  const [score, setScore]     = useState(initial);
  const [vote, setVote]       = useState<number | null>(userVote);
  const [session, setSession] = useState<Session | null>(null);

  // Load session once
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) =>
      setSession(sess)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const cast = async (val: 1 | -1) => {
    // 1) guard
    if (!session?.user.id) {
      window.location.href = "/login";
      return;
    }

    const newVote = vote === val ? 0 : val;
    setVote(newVote || null);
    setScore((prev) => prev - (vote || 0) + newVote);

    // 2) send only producerId & value
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, value: newVote }),
    });

    // 3) parse JSON safely
    let payload: { success: boolean; data?: any; error?: string };
    try {
      payload = await res.json();
    } catch {
      payload = { success: false, error: "No JSON in response" };
    }

    // 4) handle error
    if (!payload.success) {
      console.error("Vote API error:", payload.error);
      // rollback
      setVote(userVote);
      setScore(initial);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => cast(1)}>👍</button>
      <span>{score}</span>
      <button onClick={() => cast(-1)}>👎</button>
    </div>
  );
}
