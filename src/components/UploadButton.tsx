"use client";
import { useId } from "react";
import { Upload } from "lucide-react";

export default function UploadButton({
  onChange,
  multiple = false,
  label = "Upload",
  className = "",
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  label?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer ${className}`}
    >
      <Upload className="w-4 h-4" />
      <span>{label}</span>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
