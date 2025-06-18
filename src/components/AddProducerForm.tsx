"use client";
import { useState } from "react";

export default function AddProducerForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"FLOWER"|"HASH">("FLOWER");

  const add = async () => {
    await fetch("/api/admin/create-producer", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name, category })
    });
    setName("");
    // ideally revalidate or refresh the page:
    window.location.reload();
  };

  return (
    <div className="mb-6 space-x-2">
      <input
        placeholder="Producer name"
        value={name}
        onChange={e=>setName(e.target.value)}
        className="border p-2 rounded"
      />
      <select
        value={category}
        onChange={e=>setCategory(e.target.value as any)}
        className="border p-2 rounded"
      >
        <option value="FLOWER">Flower</option>
        <option value="HASH">Hash</option>
      </select>
      <button onClick={add} className="bg-green-600 text-white px-4 py-2 rounded">
        Add
      </button>
    </div>
  );
}
