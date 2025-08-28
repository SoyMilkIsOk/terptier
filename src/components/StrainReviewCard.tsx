"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Trash2, FilePenLine, Star } from "lucide-react";
import UploadButton from "./UploadButton";
import { deleteBlob } from "@/utils/blob";

export interface StrainReview {
  id: string;
  comment: string | null;
  flavor: number;
  effect: number;
  smoke: number;
  aggregateRating: number;
  imageUrl?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    profilePicUrl: string | null;
  };
  userId: string;
  producerId: string;
  strainId: string;
  updatedAt: string | Date;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill={n <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

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

export default function StrainReviewCard({
  review,
  currentUserId,
  highlighted,
}: {
  review: StrainReview;
  currentUserId?: string;
  highlighted?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(review.comment || "");
  const [flavor, setFlavor] = useState(review.flavor);
  const [effect, setEffect] = useState(review.effect);
  const [smoke, setSmoke] = useState(review.smoke);
  const [imageUrl, setImageUrl] = useState<string | null>(review.imageUrl || null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only images are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      alert("Image is too large");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data?.url) {
      setImageUrl(data.url as string);
    }
    setUploading(false);
  };

  const save = async () => {
    await fetch(`/api/strain-reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment, flavor, effect, smoke, imageUrl }),
    });
    setEditing(false);
    router.refresh();
  };

  const removeImage = async () => {
    if (imageUrl) await deleteBlob(imageUrl);
    setImageUrl(null);
  };

  const deleteReview = async () => {
    await fetch(`/api/strain-reviews?id=${review.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    router.refresh();
  };

  if (editing) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
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
          />
          {imageUrl && (
            <div className="relative">
              <Image
                src={imageUrl}
                alt="review image"
                width={80}
                height={80}
                className="object-cover rounded"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1 border"
              >
                x
              </button>
            </div>
          )}
          <UploadButton onChange={handleFileChange} />
          {uploading && (
            <p className="text-sm text-gray-500">Uploading...</p>
          )}
          <button
            onClick={save}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          {review.user.profilePicUrl ? (
            <Link href={`/profile/${review.user.username ?? review.user.id}`}>
              <img
                src={review.user.profilePicUrl}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="ml-2">
            <Link
              href={`/profile/${review.user.username ?? review.user.id}`}
              className={`font-semibold ${
                highlighted ? "text-green-600" : "hover:underline"
              }`}
            >
              {review.user.username || review.user.name || review.user.email}
            </Link>
            <p className="text-xs text-gray-500">
              Last edited {new Date(review.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        {currentUserId === review.userId && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Edit review"
            >
              <FilePenLine className="w-4 h-4" />
            </button>
            <button
              onClick={deleteReview}
              className="text-red-600 hover:text-red-800"
              aria-label="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="mb-2 text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-16">Flavor:</span>
          <StarDisplay rating={review.flavor} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16">Effect:</span>
          <StarDisplay rating={review.effect} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16">Smoke:</span>
          <StarDisplay rating={review.smoke} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 font-semibold">Overall:</span>
          <StarDisplay rating={Math.round(review.aggregateRating)} />
          <span className="text-gray-600 text-xs">
            {review.aggregateRating.toFixed(1)}
          </span>
        </div>
      </div>
      {review.comment && <p className="mb-2 whitespace-pre-wrap">{review.comment}</p>}
      {imageUrl && (
        <div className="flex flex-wrap gap-2">
          <Image
            src={imageUrl}
            alt="review image"
            width={80}
            height={80}
            className="object-cover rounded cursor-pointer"
            onClick={() => setExpandedImage(imageUrl)}
          />
        </div>
      )}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={() => setExpandedImage(null)}
        >
          <button
            aria-label="Close image"
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(null);
            }}
          >
            &times;
          </button>
          <Image
            src={expandedImage}
            alt="expanded review image"
            width={800}
            height={800}
            className="max-h-[90vh] w-auto h-auto object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}

