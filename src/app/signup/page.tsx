"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadButton from "@/components/UploadButton";
import { deleteBlob } from "@/utils/blob";
import Link from "next/link";

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
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // More comprehensive email validation
  const isValidEmail = (email: string): boolean => {
    // Basic format check
    if (!validateEmail(email)) return false;

    // Additional checks
    const parts = email.split("@");
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
    if (localPart.includes("..")) return false;

    // Domain validation
    if (domain.length === 0 || domain.length > 253) return false;
    if (domain.startsWith(".") || domain.endsWith(".")) return false;
    if (domain.includes("..")) return false;
    if (!domain.includes(".")) return false;

    // Check for valid characters
    const validLocalChars =
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
    const validDomainChars = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;

    return validLocalChars.test(localPart) && validDomainChars.test(domain);
  };

  const checkEmail = async () => {
    // Validate email before proceeding
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.exists) {
        router.push(
          `/login?email=${encodeURIComponent(
            email,
          )}&message=account already exists`,
        );
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("Failed to check email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValidUsername = (name: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(name);
  };

  const checkUsername = async (name: string) => {
    if (!name) return;
    if (!isValidUsername(name)) {
      setUsernameTaken(false);
      return;
    }
    const res = await fetch(`/api/users?username=${encodeURIComponent(name)}`);
    const data = await res.json();
    setUsernameTaken(data.exists);
  };

  const MAX_SIZE = 5 * 1024 * 1024;

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
      if (!selected.type.startsWith("image/")) {
        alert("Only images are allowed");
        return;
      }
      if (selected.size > MAX_SIZE) {
        alert("Image is too large");
        return;
      }
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
    userEmail: string,
  ) => {
    const res = await fetch("/api/users", {
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
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to create user");
    }
  };

  const handleSubmit = async () => {
    // Validate email again before submission
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidUsername(username)) {
      setError("Username can only contain letters and numbers");
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

    // ensure the username is available before creating the Supabase user
    const usernameRes = await fetch(
      `/api/users?username=${encodeURIComponent(username)}`,
    );
    const usernameData = await usernameRes.json();
    if (usernameData.exists) {
      setUsernameTaken(true);
      setError("Username already taken");
      setLoading(false);
      return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError || !data?.user) {
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
    try {
      await finalizeAuth(
        profileUrl ?? null,
        data.user.id,
        data.user.email ?? email,
      );
      router.push(
        `/login?email=${encodeURIComponent(email)}&message=${encodeURIComponent(
          "Account created successfully. Check your inbox to verify your email.",
        )}`,
      );
    } catch (err: any) {
      setError(err.message);
      setStep(2);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow my-8 mx-2">
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <button
            onClick={checkEmail}
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
          <p className="mt-1 text-center text-base">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-700 underline font-medium"
            >
              Log in
            </Link>
          </p>
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
          <p className="text-sm text-center text-gray-600">
            You'll receive a verification email. Please check your inbox after
            signing up.
          </p>
          <div>
            <label className="block">
              Email
              <input
                type="email"
                name="email"
                value={email}
                readOnly
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md bg-gray-100"
              />
            </label>
          </div>
          <div>
            <label className="block">
              Username <span className="text-red-500">*</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                pattern="[A-Za-z0-9]+"
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
                  onClick={async () => {
                    if (uploadUrl) await deleteBlob(uploadUrl);
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
          <div className="relative group">
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
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <div className="absolute right-0 top-full mt-1 hidden group-focus-within:block group-hover:block bg-white border text-xs p-2 rounded shadow">
              Use at least 8 characters, including numbers and symbols.
            </div>
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
          <p className="text-sm text-gray-600">
            Password must be at least 8 characters.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Submit
          </button>
          <p className="mt-4 text-center text-base">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-green-700 underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-green-700 underline font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
