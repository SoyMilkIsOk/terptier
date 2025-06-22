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

  const uploadFiles = async () => {
    const uploaded: string[] = [];
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id ?? "anon";
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
    <div className="border rounded p-4 mb-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2 mb-2" placeholder="Leave a comment" />
      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <button onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>
    </div>
  );
}
