"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import type { Strain } from "@prisma/client";

type StrainWithSlug = Pick<
  Strain,
  "id" | "name" | "description" | "imageUrl" | "releaseDate" | "strainSlug"
>;

export default function AddStrainForm({
  producerId,
  strain,
  onSaved,
}: {
  producerId: string;
  strain?: StrainWithSlug;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(strain?.name ?? "");
  const [description, setDescription] = useState(strain?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(strain?.imageUrl ?? null);
  function formatInputDate(date?: string | Date | null) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  }

  const [releaseDate, setReleaseDate] = useState(
    formatInputDate(strain?.releaseDate ?? null),
  );

  const save = async () => {
    const body = {
      producerId,
      name,
      description,
      imageUrl,
      releaseDate: releaseDate || null,
    };
    if (strain) {
      await fetch(`/api/strains/${strain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
    } else {
      await fetch("/api/strains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
    }
    setName("");
    setDescription("");
    setImageUrl(null);
    onSaved ? onSaved() : window.location.reload();
  };

  return (
    <div className="mb-6 space-y-2">
      <ImageUpload value={imageUrl} onChange={setImageUrl} />
      <input
        placeholder="Strain name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        placeholder="Release date"
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={save}
        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {strain ? "Save" : "Add"}
      </button>
    </div>
  );
}
