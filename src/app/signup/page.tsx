"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadButton from "@/components/UploadButton";

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
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const checkUsername = async (name: string) => {
    if (!name) return;
    const res = await fetch(`/api/users?username=${encodeURIComponent(name)}`);
    const data = await res.json();
    setUsernameTaken(data.exists);
  };

  const uploadFile = async (f: File) => {
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.url as string;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setUploadUrl(null);
    if (selected) {
      setUploading(true);
      try {
        const url = await uploadFile(selected);
        setUploadUrl(url);
      } catch {
        setError("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const finalizeAuth = async (
    profileUrl: string | null,
    id: string,
    userEmail: string
  ) => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        email: userEmail,
        name: username,
        username,
        birthday,
        profilePicUrl: profileUrl,
        socialLink,
      }),
    });
  };

  const handleSubmit = async () => {
    setError(null);
    // verify username availability in case the user didn't leave the field
    const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
    const userCheck = await res.json();
    if (userCheck.exists) {
      setUsernameTaken(true);
      setError("Username already taken");
      return;
    }
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError || !signUpData?.user) {
      setError(signUpError?.message || "Signup failed");
      setLoading(false);
      return;
    }
    let profileUrl = uploadUrl;
    if (!profileUrl && file) {
      try {
        profileUrl = await uploadFile(file);
      } catch {
        setError("Failed to upload image");
      }
    }
    await finalizeAuth(profileUrl ?? null, signUpData.user.id, signUpData.user.email ?? email);
    setLoading(false);
    router.push(`/login?email=${encodeURIComponent(email)}&message=Account created successfully`);
  };

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
          <label className="block">
            Email <span className="text-red-500">*</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <button
            onClick={checkEmail}
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Continue
          </button>
        </div>
      )}
      {step === 2 && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          autoComplete="on"
        >
          <h1 className="text-2xl font-semibold text-center">Create Account</h1>
          <input type="hidden" name="email" value={email} autoComplete="email" />
          <div>
            <label className="block">
              Username <span className="text-red-500">*</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameTaken(false);
                }}
                onBlur={(e) => checkUsername(e.target.value)}
                title={usernameTaken ? "Username already taken" : ""}
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            {usernameTaken && (
              <p className="text-red-500 text-sm">Username already taken</p>
            )}
          </div>
          <div>
            <label className="block">
              Birthday <span className="text-red-500">*</span>
              <input
                type="date"
                name="birthday"
                required
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
          <div>
            <label className="block">Social link (optional)</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block">Profile Picture</label>
            <UploadButton onChange={handleFileChange} className="mt-1" />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {uploadUrl && (
              <div className="relative mt-2 w-20 h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadUrl}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadUrl(null);
                    setFile(null);
                  }}
                  className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1 border"
                >
                  x
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block">
              Password <span className="text-red-500">*</span>
              <input
                type="password"
                name="new-password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                title="Use at least 8 characters with a mix of letters, numbers, and symbols"
              />
              {passwordFocused && (
                <p className="text-xs text-gray-600 mt-1">
                  Use at least 8 characters with a mix of letters, numbers and symbols.
                </p>
              )}
            </label>
          </div>
          <div>
            <label className="block">
              Confirm Password <span className="text-red-500">*</span>
              <input
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                required
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
