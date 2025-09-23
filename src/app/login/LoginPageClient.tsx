"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_STATE_SLUG } from "@/lib/stateConstants";

const STATE_STORAGE_KEY = "terptier:selectedState";
const STATE_COOKIE_NAME = "preferredState";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const prefill = searchParams.get("email") || "";
  const message = searchParams.get("message");
  const [identifier, setIdentifier] = useState(prefill);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPreferredStateSlug = () => {
    if (typeof window === "undefined") {
      return DEFAULT_STATE_SLUG;
    }

    const cookieSlug = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${STATE_COOKIE_NAME}=`));

    if (cookieSlug) {
      const value = cookieSlug.split("=")[1];
      if (value) {
        const decoded = decodeURIComponent(value);
        if (decoded) {
          return decoded;
        }
      }
    }

    const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    return DEFAULT_STATE_SLUG;
  };

  const finalizeAuth = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(session.access_token);

      if (user && session) {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
          }),
        });
        const meRes = await fetch("/api/users/me");
        const meData: {
          success: boolean;
          isGlobalAdmin?: boolean;
          stateAdminAssignments?: { stateSlug?: string | null }[];
        } = await meRes.json();
        if (meData.success) {
          const preferredState = getPreferredStateSlug();
          const assignedStates = Array.isArray(meData.stateAdminAssignments)
            ? meData.stateAdminAssignments
                .map((assignment: { stateSlug?: string | null }) => assignment?.stateSlug)
                .filter((slug): slug is string => Boolean(slug))
            : [];

          if (meData.isGlobalAdmin) {
            router.push(`/${preferredState}/admin`);
          } else if (assignedStates.length > 0) {
            const targetState = assignedStates.includes(preferredState)
              ? preferredState
              : assignedStates[0];
            router.push(`/${targetState}/admin`);
          } else {
            router.push(`/${DEFAULT_STATE_SLUG}/rankings`);
          }
        } else {
          router.push("/");
        }
        return;
      }

      const fallbackError = userError?.message || sessionError?.message || "Authentication failed";
      setError(fallbackError);
      return;
    }

    const fallbackError = sessionError?.message || "Authentication failed";
    setError(fallbackError);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    let loginEmail = identifier;
    if (!identifier.includes("@")) {
      try {
        const res = await fetch(
          `/api/users?username=${encodeURIComponent(identifier)}&getEmail=true`
        );
        const data = await res.json();
        if (data.email) {
          loginEmail = data.email;
        } else {
          setError("Account not found");
          setLoading(false);
          return;
        }
      } catch {
        setError("Failed to lookup account");
        setLoading(false);
        return;
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("confirm")) {
        setError(
          "Please verify your email address before logging in. Check your inbox for the verification link."
        );
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    await finalizeAuth();
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8 mx-2">
      {reason === "vote_redirect" && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Access Required</p>
          <p>You must be logged in to vote.</p>
        </div>
      )}
      {message && (
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6"
          role="alert"
        >
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
        type="text"
        name="identifier"
        autoComplete="username"
        placeholder="Email or Username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
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
        className={`w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-150 ${
          loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        Log In
      </button>
      <p className="mt-4 text-center text-base">
        Need an account?{" "}
        <a href="/signup" className="text-green-700 underline font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default function LoginPageClient() {
  return (
    <div className="max-w-md min-h-[calc(100vh-200px)] mx-auto p-6 mt-8 mx-2">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
