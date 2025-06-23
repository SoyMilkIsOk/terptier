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
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        />
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url) => (
            <div key={url} className="relative">
              <img src={url} className="w-20 h-20 object-cover rounded" />
              <button
                onClick={() => removeImage(url)}
                className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1 cursor-pointer border"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <input type="file" multiple onChange={handleFileChange} className="mb-3" />
        <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">Save</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow">
      <div className="flex justify-between mb-2">
        <div>
          <p className="font-semibold">{comment.user.name || comment.user.email}</p>
          <p className="text-xs text-gray-500">Last edited {new Date(comment.updatedAt).toLocaleString()}</p>
        </div>
        {currentUserId === comment.userId && (
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap mb-2">{comment.text}</p>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <Image key={url} src={url} alt="comment image" width={80} height={80} className="object-cover rounded" />
        ))}
      </div>
    </div>
  );
}
