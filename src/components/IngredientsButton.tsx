"use client";
import { useState } from "react";
import Modal from "./Modal";
import { Info } from "lucide-react";

export default function IngredientsButton({ ingredients }: { ingredients: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center text-sm text-blue-600 hover:underline"
      >
        <Info className="w-4 h-4 mr-1" /> Ingredients
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <p className="whitespace-pre-wrap">{ingredients}</p>
      </Modal>
    </>
  );
}
