// src/components/CategoryToggle.tsx
"use client";

interface CategoryToggleProps {
  view: "flower" | "hash";
  setView: (view: "flower" | "hash") => void;
}

export default function CategoryToggle({ view, setView }: CategoryToggleProps) {
  const isFlower = view === "flower";

  return (
    <div className="relative flex items-center w-40 h-10 bg-gray-200 rounded-full p-1 cursor-pointer" onClick={() => setView(isFlower ? "hash" : "flower")}>
      <div
        className={`absolute left-0 w-1/2 h-full bg-blue-500 rounded-full transform transition-transform duration-300 ease-in-out ${
          isFlower ? "translate-x-0" : "translate-x-full"
        }`}
      />
      <div className="relative z-10 flex justify-around w-full">
        <span className={`font-medium ${isFlower ? "text-white" : "text-gray-700"}`}>Flower</span>
        <span className={`font-medium ${!isFlower ? "text-white" : "text-gray-700"}`}>Hash</span>
      </div>
    </div>
  );
}
