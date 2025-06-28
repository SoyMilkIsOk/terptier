"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import UploadButton from "./UploadButton";
import type { User } from "@supabase/supabase-js";

export default function AddCommentForm({ producerId }: { producerId: string }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const uploadFiles = async () => {
    const uploaded: string[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.url) uploaded.push(data.url as string);
    }
    return uploaded;
  };

  const submit = async () => {
    if (!user) {
      router.push("/login?reason=comment");
      return;
    }
    const urls = await uploadFiles();
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, text, images: urls }),
    });
    setText("");
    setFiles([]);
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
        multiple
        onChange={handleFileChange}
        disabled={!user}
        onClick={() => {
          if (!user) router.push("/login?reason=comment");
        }}
      />
      <button
        onClick={submit}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 ml-2 rounded-md"
      >
        Submit
      </button>
    </div>
  );
}
