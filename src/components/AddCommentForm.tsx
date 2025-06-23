"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AddCommentForm({ producerId }: { producerId: string }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const uploadFiles = async (uid: string) => {
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `${uid}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("comment-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("comment-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    return uploaded;
  };

  const submit = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login?reason=comment");
      return;
    }
    const urls = await uploadFiles(session.user.id);
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
    <div className="bg-white shadow rounded-lg p-4 mb-6 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded-md p-2"
        placeholder="Leave a comment"
      />
      <input type="file" multiple onChange={handleFileChange} />
      <button
        onClick={submit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
      >
        Submit
      </button>
    </div>
  );
}
