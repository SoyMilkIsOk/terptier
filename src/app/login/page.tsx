// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const reason = searchParams.get("reason"); // Get reason query param
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);

  const handleAuth = async () => {
    // 1) Try to sign in
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      // 2) If sign-in fails, try to sign up the user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // 3) After sign-up, immediately sign in
      const { data: signIn2Data, error: signIn2Error } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signIn2Error) {
        setError(signIn2Error.message);
        return;
      }
    }

    // 4) If we have a session, redirect to admin
    const {
      data: { session },
      error: finalError,
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/admin");
    } else {
      setError(finalError?.message ?? "Authentication failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {reason === "vote_redirect" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Access Required</p>
          <p>You must be logged in to vote.</p>
        </div>
      )}
      <h1 className="text-2xl mb-4 text-center font-semibold">Log In / Sign Up</h1>
      {error && <div className="text-red-500 mb-2 p-3 bg-red-100 border border-red-400 rounded">{error}</div>}

      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        className="w-full mb-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150"
      >
        Continue with Google
      </button>
      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: "discord" })}
        className="w-full mb-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150"
      >
        Continue with Discord
      </button>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />

      <button
        onClick={handleAuth}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150"
      >
        Log In / Sign Up with Email
      </button>
    </div>
  );
}
