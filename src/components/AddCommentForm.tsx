"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import UploadButton from "./UploadButton";
import type { Session } from "@supabase/supabase-js";

export default function AddCommentForm({ producerId }: { producerId: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) =>
      setSession(sess)
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const uploadFile = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data?.url as string | null;
  };

  const submit = async () => {
    if (!session?.user) {
      router.push("/login?reason=comment");
      return;
    }
    const url = await uploadFile();
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, text, images: url ? [url] : [] }),
    });
    setText("");
    setFile(null);
    router.refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded-md p-2"
        placeholder="Leave a comment"
      />
      <UploadButton
        onChange={handleFileChange}
        disabled={!session?.user}
        onClick={() => {
          if (!session?.user) router.push("/login?reason=comment");
        }}
      />
      {file && (
        <div className="relative inline-block ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
  );
}
