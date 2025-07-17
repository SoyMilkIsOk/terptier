"use client";
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";

export default function AttributesFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (attrs: string[]) => void;
}) {
  const toggle = (key: string) => {
    const newValues = selected.includes(key)
      ? selected.filter((a) => a !== key)
      : [...selected, key];
    onChange(newValues);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ATTRIBUTE_OPTIONS.map((attr) => (
        <label
          key={attr.key}
          className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 text-sm"
        >
          <input
            type="checkbox"
            className="text-green-600"
            checked={selected.includes(attr.key)}
            onChange={() => toggle(attr.key)}
          />
          <span className="text-lg">{attr.icon}</span>
          <span className="whitespace-nowrap">{attr.label}</span>
        </label>
      ))}
    </div>
  );
}
