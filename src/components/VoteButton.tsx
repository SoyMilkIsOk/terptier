// src/components/VoteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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
  console.log(`[VoteButton.tsx] producer ${producerId}: initial render. userVote prop =`, userVote, "initial score =", initial);
  const [score, setScore]     = useState(initial);
  const [vote, setVote]       = useState<number | null>(userVote);
  const [session, setSession] = useState<Session | null>(null);
  console.log(`[VoteButton.tsx] producer ${producerId}: vote state initialized to =`, vote);

  // Effect to update vote state if userVote prop changes after initial render
  useEffect(() => {
    console.log(`[VoteButton.tsx] producer ${producerId}: userVote prop changed to =`, userVote, "Current vote state =", vote);
    // Only update from prop if it's different to prevent potential infinite loops
    // and to respect local changes if user has already interacted.
    // This logic might need refinement based on how "interacted with" is defined.
    // For now, a direct update if different seems reasonable for prop-driven changes.
    if (userVote !== vote) {
      setVote(userVote);
      console.log(`[VoteButton.tsx] producer ${producerId}: vote state updated to =`, userVote, "due to prop change.");
    }
  }, [userVote, vote, producerId]); // Added vote and producerId to dependency array for completeness in logging

  // Load session once
  useEffect(() => {
    console.log(`[VoteButton.tsx] producer ${producerId}: useEffect for session running.`);
    supabase.auth.getSession().then(({ data }) => {
      console.log(`[VoteButton.tsx] producer ${producerId}: session fetched data =`, data.session?.user?.id);
      setSession(data.session)
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
      console.log(`[VoteButton.tsx] producer ${producerId}: onAuthStateChange triggered, new session user id =`, sess?.user?.id);
      setSession(sess)
    });
    return () => listener.subscription.unsubscribe();
  }, [producerId]); // Added producerId to dependency array for completeness in logging


  const cast = async (val: 1 | -1) => {
    // 1) guard
    if (!session?.user.id) {
      window.location.href = "/login?reason=vote_redirect";
      return;
    }

    const newVote = vote === val ? null : val; // Changed 0 to null for consistency
    setVote(newVote);
    setScore((prev) => prev - (vote || 0) + (newVote || 0)); // Ensure newVote is handled as 0 if null

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
      <button onClick={() => cast(1)}>
        <ThumbsUp
          className={`w-5 h-5 ${
            vote === 1 ? "text-green-500" : "text-gray-500"
          }`}
        />
      </button>
      <span>{score}</span>
      <button onClick={() => cast(-1)}>
        <ThumbsDown
          className={`w-5 h-5 ${
            vote === -1 ? "text-red-500" : "text-gray-500"
          }`}
        />
      </button>
    </div>
  );
}
