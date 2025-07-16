"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const prefill = searchParams.get("email") || "";
  const message = searchParams.get("message");
  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finalizeAuth = async () => {
    const {
      data: { session },
      error: finalError,
    } = await supabase.auth.getSession();

    if (session) {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
        }),
      });
      const meRes = await fetch("/api/users/me");
      const meData = await meRes.json();
      if (meData.success) {
        if (meData.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(`/profile/${meData.username || meData.id}`);
        }
      } else {
        router.push("/");
      }
    } else {
      setError(finalError?.message ?? "Authentication failed");
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await finalizeAuth();
    setLoading(false);
  };


  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8 mx-2">
      {reason === "vote_redirect" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Access Required</p>
          <p>You must be logged in to vote.</p>
        </div>
      )}
      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p>{message}</p>
        </div>
      )}
      <h1 className="text-2xl mb-4 text-center font-semibold">Log In</h1>
      {error && (
        <div className="text-red-500 mb-2 p-3 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      <input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={handleSignIn}
        disabled={loading}
        className={`w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        Log In
      </button>
      <p className="mt-4 text-center text-base">
        Need an account?{' '}
        <a href="/signup" className="text-green-700 underline font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
