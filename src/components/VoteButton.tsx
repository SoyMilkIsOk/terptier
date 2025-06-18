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
  const [isVoting, setIsVoting] = useState(false); // Added isVoting state
  console.log(`[VoteButton.tsx] producer ${producerId}: vote state initialized to =`, vote);

  // Effect to update vote state if userVote prop changes or if local vote state changes (for logging sync issues)
  useEffect(() => {
    const id = producerId || 'N/A'; // Ensure producerId is available for logging
    console.log(`[VoteButton ${id}] SYNC EFFECT. userVote PROP: ${userVote}, current vote STATE: ${vote}`);
    if (userVote !== vote) {
      console.log(`[VoteButton ${id}] SYNC EFFECT - MISMATCH DETECTED. Setting vote STATE to: ${userVote}`);
      setVote(userVote);
    }
  }, [userVote, vote, producerId]);

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
    if (isVoting) {
      console.log(`[VoteButton.tsx] producer ${producerId}: Already processing a vote.`);
      return;
    }

    // 1) guard for session
    if (!session?.user.id) {
      window.location.href = "/login?reason=vote_redirect";
      return;
    }

    setIsVoting(true);
    const originalVote = vote; // Store original vote for potential rollback
    const originalScore = score; // Store original score for potential rollback

    const newVote = vote === val ? null : val;
    setVote(newVote); // Optimistic update for UI
    setScore((prev) => prev - (originalVote || 0) + (newVote || 0)); // Optimistic update for UI

    try {
      // Log the payload before sending
      console.log(
        `[VoteButton ${producerId}] API CALL PREP. Payload:`,
        JSON.stringify({ producerId, value: newVote })
      );

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
      } catch (e) {
        payload = { success: false, error: `JSON parsing error: ${(e as Error).message}` };
      }

      // 4) handle error
      if (!payload.success) {
        console.error("Vote API error:", payload.error);
        // rollback optimistic updates
        setVote(originalVote);
        setScore(originalScore);
      }
      // If successful, optimistic updates remain
    } catch (error) {
      console.error("Network or unexpected error during vote:", error);
      // rollback optimistic updates
      setVote(originalVote);
      setScore(originalScore);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => cast(1)} disabled={isVoting} className={isVoting ? "cursor-not-allowed" : ""}>
        <ThumbsUp
          className={`w-5 h-5 ${
            vote === 1 ? "text-green-500" : "text-gray-500"
          } ${isVoting ? "opacity-50" : ""}`}
        />
      </button>
      <span>{score}</span>
      <button onClick={() => cast(-1)} disabled={isVoting} className={isVoting ? "cursor-not-allowed" : ""}>
        <ThumbsDown
          className={`w-5 h-5 ${
            vote === -1 ? "text-red-500" : "text-gray-500"
          } ${isVoting ? "opacity-50" : ""}`}
        />
      </button>
    </div>
  );
}
