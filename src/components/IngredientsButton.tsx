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
        className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
        aria-label="Ingredients"
      >
        <Info className="w-5 h-5" />
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <p className="whitespace-pre-wrap text-sm">{ingredients}</p>
      </Modal>
    </>
  );
}
