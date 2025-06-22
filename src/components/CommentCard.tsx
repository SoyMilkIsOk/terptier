"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export interface CommentData {
  id: string;
  text: string;
  imageUrls: string[];
  user: { id: string; name: string | null; email: string };
  userId: string;
  producerId: string;
  updatedAt: string | Date;
}

export default function CommentCard({ comment, currentUserId }: { comment: CommentData; currentUserId?: string; }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);
  const [images, setImages] = useState<string[]>(comment.imageUrls);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const uploadFiles = async () => {
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `${currentUserId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("comment-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("comment-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    return uploaded;
  };

  const save = async () => {
    const newUrls = await uploadFiles();
    const allImages = [...images, ...newUrls];
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId: comment.producerId, text, images: allImages }),
    });
    setFiles([]);
    setEditing(false);
    router.refresh();
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  if (editing) {
    return (
      <div className="border rounded p-4 mb-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2 mb-2" />
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((url) => (
            <div key={url} className="relative">
              <img src={url} className="w-20 h-20 object-cover rounded" />
              <button onClick={() => removeImage(url)} className="absolute top-0 right-0 bg-white rounded-full text-xs px-1 cursor-pointer">x</button>
            </div>
          ))}
        </div>
        <input type="file" multiple onChange={handleFileChange} className="mb-2" />
        <button onClick={save} className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer">Save</button>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 mb-4">
      <p className="font-semibold mb-1">{comment.user.name || comment.user.email}</p>
      <p className="whitespace-pre-wrap mb-2">{comment.text}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url) => (
          <Image key={url} src={url} alt="comment image" width={80} height={80} className="object-cover rounded" />
        ))}
      </div>
      {currentUserId === comment.userId && (
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 cursor-pointer">Edit</button>
      )}
    </div>
  );
}
