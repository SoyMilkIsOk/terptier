"use client";
import { useState } from "react";
import UploadButton from "./UploadButton";

export default function ProfileImageUpload({
  initialUrl,
}: {
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data?.url) {
      setUrl(data.url as string);
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicUrl: data.url }),
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    upload(e.target.files[0]);
  };

  const remove = async () => {
    setLoading(true);
    setUrl(null);
    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profilePicUrl: null }),
    });
    setLoading(false);
  };

  return (
    <div className="relative w-24 h-24">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-100 sm:opacity-0 sm:hover:opacity-100 flex items-center justify-center transition">
            <UploadButton onChange={handleChange} className="text-black" />
          </div>
          <button
            type="button"
            onClick={remove}
            className="absolute -top-1 -right-1 rounded-full text-xs px-1.25 border"
          >
            x
          </button>
        </>
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
          <UploadButton onChange={handleChange} />
        </div>
      )}
      {loading && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-sm animate-pulse">
          Uploading...
        </span>
      )}
    </div>
  );
}
