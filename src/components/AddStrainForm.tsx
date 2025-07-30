"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import type { Strain } from "@prisma/client";

export default function AddStrainForm({
  producerId,
  strain,
  onSaved,
}: {
  producerId: string;
  strain?: Strain;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(strain?.name ?? "");
  const [description, setDescription] = useState(strain?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(strain?.imageUrl ?? null);

  const save = async () => {
    const body = {
      producerId,
      name,
      description,
      imageUrl,
    };
    if (strain) {
      await fetch(`/api/strains/${strain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/strains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <button
        onClick={save}
        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {strain ? "Save" : "Add"}
      </button>
    </div>
  );
}
