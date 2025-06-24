"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VoteButton from "@/components/VoteButton";

export interface CommentData {
  id: string;
  text: string;
  imageUrls: string[];
  user: { id: string; name: string | null; email: string };
  userId: string;
  producerId: string;
  updatedAt: string | Date;
  producer?: { id: string; name: string }; // Optional producer info
  voteValue?: number | null;
}

export default function CommentCard({
  comment,
  currentUserId,
  highlighted,
}: {
  comment: CommentData;
  currentUserId?: string;
  highlighted?: boolean;
}) {
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
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.url) uploaded.push(data.url as string);
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
          <p className={`font-semibold ${highlighted ? "text-blue-600" : ""}`}>{comment.user.name || comment.user.email}</p>
          <p className="text-xs text-gray-500">Last edited {new Date(comment.updatedAt).toLocaleString()}</p>
        </div>
        {currentUserId === comment.userId && (
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
        )}
      </div>
      {comment.producer && (
        <p className="text-sm text-gray-700 mb-1">
          For producer: <a href={`/producer/${comment.producer.id}`} className="underline hover:text-blue-600">{comment.producer.name}</a>
        </p>
      )}
      <div className="mb-2">
        {comment.voteValue !== null && comment.voteValue !== undefined ? (
          <VoteButton
            producerId={comment.producerId}
            initialAverage={comment.voteValue}
            userRating={comment.voteValue}
            readOnly
            showNumber={false}
          />
        ) : (
          <span className="italic text-sm text-gray-600">No rating</span>
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
