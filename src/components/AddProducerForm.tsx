"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import type { Producer } from "@prisma/client";

type ProducerWithAttrs = Producer & { attributes: string[] };
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";

export default function AddProducerForm({
  producer,
  onSaved,
}: {
  producer?: ProducerWithAttrs;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(producer?.name ?? "");
  const [category, setCategory] = useState<"FLOWER" | "HASH">(
    producer?.category ?? "FLOWER"
  );
  const [website, setWebsite] = useState(producer?.website ?? "");
  const [ingredients, setIngredients] = useState(producer?.ingredients ?? "");
  const [slug, setSlug] = useState(producer?.slug ?? "");
  const [attributes, setAttributes] = useState<string[]>(producer?.attributes ?? []);
  const [profileImage, setProfileImage] = useState<string | null>(
    producer?.profileImage ?? null
  );

  const save = async () => {
    const body = {
      name,
      category,
      website,
      ingredients,
      slug,
      profileImage,
      attributes,
      stateCode: "CO",
    };
    if (producer) {
      await fetch(`/api/producers/${producer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/create-producer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setName("");
    setWebsite("");
    setIngredients("");
    setSlug("");
    setProfileImage(null);
    setAttributes([]);
    // ideally revalidate or refresh the page:
    if (onSaved) onSaved();
    else window.location.reload();
  };

  return (
    <div className="mb-6 space-y-2">
      <ImageUpload value={profileImage} onChange={setProfileImage} />
      <input
        placeholder="Producer name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <textarea
        placeholder="Ingredients"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <div className="flex flex-wrap gap-2">
        {ATTRIBUTE_OPTIONS[category].map((attr) => (
          <label key={attr.key} className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={attributes.includes(attr.key)}
              onChange={() =>
                setAttributes((prev) =>
                  prev.includes(attr.key)
                    ? prev.filter((a) => a !== attr.key)
                    : [...prev, attr.key]
                )
              }
            />
            <span>{attr.icon}</span>
            <span>{attr.label}</span>
          </label>
        ))}
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as any)}
        className="border p-2 rounded w-full"
      >
        <option value="FLOWER">Flower</option>
        <option value="HASH">Hash</option>
      </select>
      <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
        {producer ? "Save" : "Add"}
      </button>
    </div>
  );
}
