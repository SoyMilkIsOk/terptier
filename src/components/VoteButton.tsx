// src/components/VoteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // Import useRouter

export default function VoteButton({
  producerId,
  initial, // Overall score from server
  userVote, // User's specific vote (1, -1, 0, or null/undefined) from server
}: {
  producerId: string;
  initial: number;
  userVote: number | null | undefined; // Allow undefined for clarity
}) {
  const router = useRouter(); // Initialize useRouter
  // Log initial props. Note: producerId might be undefined briefly if not passed correctly, handle in logs.
  const pId = producerId || "UNKNOWN_PRODUCER_ID";
  console.log(`[VoteButton ${pId}] INITIAL RENDER. userVote PROP: ${userVote}, initial SCORE: ${initial}`);

  const [currentScore, setCurrentScore] = useState(initial);
  const [session, setSession] = useState<Session | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Effect to update currentScore if initial total score from server changes
  useEffect(() => {
    console.log(`[VoteButton ${pId}] INITIAL SCORE EFFECT. initial: ${initial}, currentScore: ${currentScore}`);
    // Only update if different to avoid potential loops if logic evolves,
    // and if `initial` is actually a new value, not just a parent re-render with same prop.
    if (initial !== currentScore) {
        setCurrentScore(initial);
    }
  }, [initial, pId]); // Simplified dependency array. currentScore removed to prevent re-running if only currentScore changes locally.

  // Load session once
  useEffect(() => {
    console.log(`[VoteButton ${pId}] SESSION EFFECT. Running.`);
    supabase.auth.getSession().then(({ data }) => {
      console.log(`[VoteButton ${pId}] SESSION EFFECT. Session data fetched. User ID: ${data.session?.user?.id}`);
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      console.log(`[VoteButton ${pId}] SESSION EFFECT. Auth state changed. New user ID: ${sess?.user?.id}`);
      setSession(sess);
    });
    return () => {
      console.log(`[VoteButton ${pId}] SESSION EFFECT. Unsubscribing from auth changes.`);
      listener?.subscription.unsubscribe();
    };
  }, [pId]);


  const cast = async (val: 1 | -1) => {
    if (isVoting) {
      console.log(`[VoteButton ${pId}] CAST. Attempted to vote while already voting. Aborted.`);
      return;
    }
    if (!session?.user.id) {
      console.log(`[VoteButton ${pId}] CAST. User not logged in. Redirecting to login.`);
      router.push("/login?reason=vote_redirect");
      return;
    }

    setIsVoting(true);
    // originalCommittedScore is the score from the server before this action
    // For rollback, we revert to this state if API fails.
    const originalCommittedScore = initial;
    const currentUserVoteValue = userVote || 0; // Treat null/undefined as 0 for calculation

    // newVote is the vote value to be sent to API (1, -1, or 0 for un-vote)
    const newVote = currentUserVoteValue === val ? 0 : val;

    // Optimistic UI update for score: Score starts at `initial`. Subtract previous userVote, add newVote.
    const optimisticScore = initial - currentUserVoteValue + newVote;
    console.log(`[VoteButton ${pId}] CAST. val: ${val}, userVote: ${userVote}, newVote: ${newVote}, initial: ${initial}, optimisticScore: ${optimisticScore}`);
    setCurrentScore(optimisticScore);

    try {
      console.log(
        `[VoteButton ${pId}] CAST. API CALL PREP. Payload:`,
        JSON.stringify({ producerId: pId, value: newVote })
      );
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producerId: pId, value: newVote }), // Use pId here for safety
      });

      let payload: { success: boolean; data?: any; error?: string };
      try {
        payload = await res.json();
      } catch (e) {
        payload = { success: false, error: `JSON parsing error: ${(e as Error).message}` };
      }

      if (!payload.success) {
        console.error(`[VoteButton ${pId}] CAST. API Error:`, payload.error);
        setCurrentScore(originalCommittedScore); // Rollback score
      } else {
        console.log(`[VoteButton ${pId}] CAST. API Success. Refreshing router.`);
        router.refresh();
      }
    } catch (err) {
      console.error(`[VoteButton ${pId}] CAST. Fetch Error:`, err);
      setCurrentScore(originalCommittedScore); // Rollback score
    } finally {
      setIsVoting(false);
    }
  };

  const displayUserVote = userVote === undefined ? null : userVote; // Treat undefined from prop as null for display logic

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => cast(1)} disabled={isVoting} className={`p-1 rounded-md transition-colors ${isVoting ? "cursor-not-allowed" : "hover:bg-gray-100"}`}>
        <ThumbsUp
          className={`w-5 h-5 ${
            displayUserVote === 1 ? "text-green-500" : "text-gray-400 hover:text-green-500"
          } ${isVoting ? "opacity-50" : ""}`}
          fill={displayUserVote === 1 ? "currentColor" : "none"}
        />
      </button>
      <span className="font-medium text-gray-700 w-6 text-center">{currentScore}</span>
      <button onClick={() => cast(-1)} disabled={isVoting} className={`p-1 rounded-md transition-colors ${isVoting ? "cursor-not-allowed" : "hover:bg-gray-100"}`}>
        <ThumbsDown
          className={`w-5 h-5 ${
            displayUserVote === -1 ? "text-red-500" : "text-gray-400 hover:text-red-500"
          } ${isVoting ? "opacity-50" : ""}`}
          fill={displayUserVote === -1 ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
