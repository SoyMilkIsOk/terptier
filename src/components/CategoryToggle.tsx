// src/components/CategoryToggle.tsx
"use client";

interface CategoryToggleProps {
  view: "flower" | "hash";
  setView: (view: "flower" | "hash") => void;
}

export default function CategoryToggle({ view, setView }: CategoryToggleProps) {
  const isFlower = view === "flower";

  const handleToggle = () => {
    setView(isFlower ? "hash" : "flower");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className="relative flex items-center w-50 h-11 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-1.5 cursor-pointer select-none shadow-inner border border-gray-400 hover:shadow-md transition-all duration-200"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="switch"
      aria-checked={isFlower}
      aria-label="Toggle between flower and hash view"
    >
      {/* Sliding indicator */}
      <div
        className={`absolute left-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-green-600 to-green-700 rounded-full transform transition-all duration-300 ease-out shadow-lg ${
          isFlower ? "translate-x-0 w-24" : "translate-x-24 w-22"
        }`}
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
        }}
      />
      
      {/* Labels */}
      <div className="relative z-10 flex w-full">
        <div className="flex items-center justify-center w-24 h-full">
          <span 
            className={`font-semibold text-sm transition-all duration-300 ease-out ${
              isFlower 
                ? "text-white drop-shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🌸 Flower
          </span>
        </div>
        <div className="flex items-center justify-center w-22 h-full">
          <span 
            className={`font-semibold text-sm transition-all duration-300 ease-out ${
              !isFlower 
                ? "text-white drop-shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🍯 Hash
          </span>
        </div>
      </div>
      
      {/* Focus ring */}
      <div className="absolute inset-0 rounded-full ring-2 ring-green-400 ring-opacity-0 transition-all duration-200 focus-within:ring-opacity-50" />
    </div>
  );
}