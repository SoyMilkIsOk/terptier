"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkEmail = async () => {
    setLoading(true);
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.exists) {
      router.push(`/login?email=${encodeURIComponent(email)}&message=account already exists`);
    } else {
      setStep(2);
    }
    setLoading(false);
  };

  const uploadFile = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.url as string;
  };

  const finalizeAuth = async (profileUrl: string | null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: username,
          username,
          birthday,
          profilePicUrl: profileUrl,
          socialLink,
        }),
      });
    }
  };

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    const bday = new Date(birthday);
    const min = new Date();
    min.setFullYear(min.getFullYear() - 21);
    if (bday > min) {
      setError("You must be 21 or older");
      return;
    }
    setLoading(true);
    const profileUrl = await uploadFile();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    await finalizeAuth(profileUrl);
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <p className="mb-4">Check your email for confirmation.</p>
        <a href="/login" className="underline">Return to login</a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={checkEmail}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Continue
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-center">Create Account</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="url"
            placeholder="Social link (optional)"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-600">Password must be at least 8 characters.</p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
