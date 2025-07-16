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
    <div className="flex flex-wrap justify-center gap-3 mb-4">
      {ATTRIBUTE_OPTIONS.map((attr) => (
        <label key={attr.key} className="flex items-center space-x-1 text-sm">
          <input
            type="checkbox"
            className="mr-1"
            checked={selected.includes(attr.key)}
            onChange={() => toggle(attr.key)}
          />
          <span>{attr.icon}</span>
          <span>{attr.label}</span>
        </label>
      ))}
    </div>
  );
}
