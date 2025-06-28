"use client";
import { useId } from "react";
import { Upload } from "lucide-react";

export default function UploadButton({
  onChange,
  multiple = false,
  className = "",
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md cursor-pointer ${className}`}
    >
      <Upload className="w-4 h-4" />
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
