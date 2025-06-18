// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
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
      <h1 className="text-2xl mb-4">Log In / Sign Up</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        className="w-full mb-2 py-2 bg-red-500 text-white rounded"
      >
        Continue with Google
      </button>
      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: "discord" })}
        className="w-full mb-4 py-2 bg-gray-900 text-white rounded"
      >
        Continue with Discord
      </button>

      <div className="border-t my-4"></div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleAuth}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        Log In / Sign Up
      </button>
    </div>
  );
}
