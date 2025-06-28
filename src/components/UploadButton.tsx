"use client";
import { useId } from "react";
import { Upload } from "lucide-react";

export default function UploadButton({
  onChange,
  multiple = false,
  className = "",
  disabled = false,
  onClick,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"} text-white p-2 rounded-md ${className}`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Upload className="w-4 h-4" />
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
}
