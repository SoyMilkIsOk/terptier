"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Trash2, FilePenLine } from "lucide-react";
import VoteButton from "@/components/VoteButton";
import UploadButton from "./UploadButton";

export interface CommentData {
  id: string;
  text: string;
  imageUrls: string[];
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    profilePicUrl: string | null;
  };
  userId: string;
  producerId: string;
  updatedAt: string | Date;
  producer?: { id: string; name: string; slug: string | null };
  voteValue?: number | null;
}

export default function CommentCard({
  comment,
  currentUserId,
  highlighted,
  showRating = true,
}: {
  comment: CommentData;
  currentUserId?: string;
  highlighted?: boolean;
  showRating?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);
  const [images, setImages] = useState<string[]>(comment.imageUrls);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.url) {
        setImages((prev) => [...prev, data.url as string]);
      }
    }
    setUploading(false);
  };

  const save = async () => {
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId: comment.producerId, text, images }),
    });
    setEditing(false);
    router.refresh();
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const deleteComment = async () => {
    await fetch(`/api/comments?id=${comment.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    router.refresh();
  };

  if (editing) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-md p-2"
        />
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url) => (
            <div key={url} className="relative">
              <img src={url} className="w-20 h-20 object-cover rounded" />
              <button
                onClick={() => removeImage(url)}
                className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1.25 cursor-pointer border"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <UploadButton multiple onChange={handleFileChange}/>
        {uploading && <p className="text-sm text-gray-500 mb-3">Uploading...</p>}
        <button onClick={save} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md ml-2">Save</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          {comment.user.profilePicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.user.profilePicUrl}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="ml-2">
            <Link
              href={`/profile/${comment.user.username ?? comment.user.id}`}
              className={`font-semibold ${highlighted ? "text-green-600" : "hover:underline"}`}
            >
              {comment.user.username || comment.user.name || comment.user.email}
            </Link>
            <p className="text-xs text-gray-500">
              Last edited {new Date(comment.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        {currentUserId === comment.userId && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Edit comment"
            >
              <FilePenLine className="w-4 h-4" />
            </button>
            <button
              onClick={deleteComment}
              className="text-red-600 hover:text-red-800"
              aria-label="Delete comment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {comment.producer && (
        <p className="text-sm text-gray-700 mb-1">
          For producer: <a href={`/producer/${comment.producer.slug ?? comment.producer.id}`} className="underline hover:text-blue-600">{comment.producer.name}</a>
        </p>
      )}
      {showRating && (
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
      )}
      <p className="whitespace-pre-wrap mb-2">{comment.text}</p>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <Image key={url} src={url} alt="comment image" width={80} height={80} className="object-cover rounded" />
        ))}
      </div>
    </div>
  );
}
