"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { CommentData } from "./CommentCard";

export default function UpdateCommentForm({ comment }: { comment: CommentData }) {
  const [text, setText] = useState(comment.text);
  const [images, setImages] = useState<string[]>(comment.imageUrls);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const uploadFiles = async (userId: string) => {
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("comment-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("comment-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    return uploaded;
  };

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login?reason=comment");
      return;
    }
    const newUrls = await uploadFiles(session.user.id);
    const allImages = [...images, ...newUrls];
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId: comment.producerId, text, images: allImages }),
    });
    setFiles([]);
    router.refresh();
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h4 className="font-semibold mb-2">Update Your Comment</h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded-md p-2 mb-3"
      />
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((url) => (
          <div key={url} className="relative">
            <Image src={url} alt="comment image" width={80} height={80} className="object-cover rounded" />
            <button
              onClick={() => removeImage(url)}
              className="absolute -top-1 -right-1 bg-white text-xs rounded-full px-1 cursor-pointer border"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <input type="file" multiple onChange={handleFileChange} className="mb-3" />
      <button
        onClick={save}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
      >
        Save
      </button>
    </div>
  );
}
