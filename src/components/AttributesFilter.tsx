"use client";
import type { SearchTheme } from "@/lib/market-theme";
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";

type AttributesFilterAppearance = Pick<
  SearchTheme,
  "attributeTag" | "attributeTagSelected" | "attributeCheckbox" | "attributeIcon" | "attributeText"
>;

const defaultAppearance: AttributesFilterAppearance = {
  attributeTag: "bg-gray-100 text-gray-700",
  attributeTagSelected: "bg-emerald-100 text-emerald-800",
  attributeCheckbox: "text-green-600",
  attributeIcon: "",
  attributeText: "",
};

export default function AttributesFilter({
  selected,
  onChange,
  category,
  appearance,
}: {
  selected: string[];
  onChange: (attrs: string[]) => void;
  category: "FLOWER" | "HASH";
  appearance?: AttributesFilterAppearance;
}) {
  const toggle = (key: string) => {
    const newValues = selected.includes(key)
      ? selected.filter((a) => a !== key)
      : [...selected, key];
    onChange(newValues);
  };

  const theme = appearance ?? defaultAppearance;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ATTRIBUTE_OPTIONS[category].map((attr) => {
        const isSelected = selected.includes(attr.key);
        return (
          <label
            key={attr.key}
            className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
              isSelected ? theme.attributeTagSelected : theme.attributeTag
            }`}
          >
            <input
              type="checkbox"
              className={`rounded ${theme.attributeCheckbox}`}
              checked={isSelected}
              onChange={() => toggle(attr.key)}
            />
            <span className={`text-lg ${theme.attributeIcon}`}>{attr.icon}</span>
            <span className={`whitespace-nowrap ${theme.attributeText}`}>
              {attr.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
