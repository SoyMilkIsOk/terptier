"use client";
import { useState } from "react";
import UploadButton from "./UploadButton";

export default function ImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data?.url) onChange(data.url as string);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    upload(e.target.files[0]);
  };

  return (
    <div className="flex items-center space-x-2">
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="uploaded" className="w-20 h-20 object-cover rounded-full" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-1 -right-1 bg-white rounded-full text-xs px-1 border"
          >
            x
          </button>
        </div>
      ) : (
        <UploadButton onChange={handleChange} />
      )}
      {loading && <span className="text-sm animate-pulse">Uploading...</span>}
    </div>
  );
}
