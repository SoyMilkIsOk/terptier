"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const { error: signIn2Error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signIn2Error) {
        setError(signIn2Error.message);
        return;
      }
    }

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
      {error && (
        <div className="text-red-500 mb-2 p-3 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
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
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 cursor-pointer"
      >
        Log In / Sign Up with Email
      </button>
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
