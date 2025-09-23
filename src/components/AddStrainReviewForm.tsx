"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import UploadButton from "./UploadButton";
import type { User } from "@supabase/supabase-js";
import { Star } from "lucide-react";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-5 h-5 cursor-pointer ${
            n <= value ? "text-yellow-400" : "text-gray-300"
          }`}
          fill={n <= value ? "currentColor" : "none"}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

export default function AddStrainReviewForm({
  strainId,
  producerId,
}: {
  strainId: string;
  producerId: string;
}) {
  const [flavor, setFlavor] = useState(0);
  const [effect, setEffect] = useState(0);
  const [smoke, setSmoke] = useState(0);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Only images are allowed");
      return;
    }
    if (f.size > MAX_SIZE) {
      alert("Image is too large");
      return;
    }
    setFile(f);
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) {
          return;
        }

        if (error && error.name !== "AuthSessionMissingError") {
          console.error("Failed to verify Supabase user", error);
        }

        setCurrentUser(user ?? null);
      } catch (err) {
        console.error("Failed to verify Supabase user", err);
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      await loadUser();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const uploadFile = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return (data?.url as string) || null;
  };

  const submit = async () => {
    if (!currentUser?.id) {
      router.push("/login?reason=review");
      return;
    }
    const url = await uploadFile();
    await fetch("/api/strain-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strainId,
        producerId,
        comment: comment || undefined,
        flavor,
        effect,
        smoke,
        imageUrl: url || undefined,
      }),
    });
    setComment("");
    setFile(null);
    setFlavor(0);
    setEffect(0);
    setSmoke(0);
    router.refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-20">Flavor</span>
          <StarRating value={flavor} onChange={setFlavor} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-20">Effect</span>
          <StarRating value={effect} onChange={setEffect} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-20">Smoke</span>
          <StarRating value={smoke} onChange={setSmoke} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-md p-2"
          placeholder="Leave a review (optional)"
        />
        <UploadButton
          onChange={handleFileChange}
          disabled={!currentUser}
          onClick={() => {
            if (!currentUser) router.push("/login?reason=review");
          }}
        />
        {file && (
          <div className="relative inline-block ml-2">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1 border"
            >
              x
            </button>
          </div>
        )}
        <button
          onClick={submit}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 ml-2 rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

