"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import type { Strain } from "@prisma/client";
import Modal from "./Modal";

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
  const [strainSlug, setStrainSlug] = useState(
    strain?.strainSlug ? String(strain.strainSlug) : "",
  );
  function formatInputDate(date?: string | Date | null) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  }

  const [releaseDate, setReleaseDate] = useState(
    formatInputDate(strain?.releaseDate ?? null),
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const save = async (confirmNotify = false) => {
    const body = {
      producerId,
      name,
      description,
      imageUrl,
      releaseDate: releaseDate || null,
      strainSlug: strainSlug || undefined,
      confirmNotify,
    };

    let res;
    if (strain) {
      res = await fetch(`/api/strains/${strain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
    } else {
      res = await fetch("/api/strains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
    }

    if (res.status === 409) {
      const data = await res.json();
      if (data.requiresConfirmation) {
        setSubscriberCount(data.subscriberCount);
        setShowConfirm(true);
        return;
      }
    }

    if (!res.ok) {
      console.error("Failed to save strain");
      return;
    }

    setName("");
    setDescription("");
    setImageUrl(null);
    setStrainSlug("");
    setShowConfirm(false);
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
      <input
        type="text"
        placeholder="Strain slug"
        value={strainSlug}
        onChange={(e) => setStrainSlug(e.target.value)}
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
        onClick={() => save(false)}
        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {strain ? "Save" : "Add"}
      </button>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Update Drop Date?</h3>
          <p className="mb-6 text-gray-600">
            This update will trigger email notifications to <span className="font-bold text-green-700">{subscriberCount}</span> subscribed users.
            Are you sure you want to proceed?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => save(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm & Notify
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
