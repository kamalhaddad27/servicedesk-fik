"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { X, File as FileIcon, Upload } from "lucide-react";
import Image from "next/image";

interface FilePickerProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  className?: string;
}

export function FilePicker({ file, onFileChange, className }: FilePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Efek untuk membuat pratinjau saat file berubah
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] || null);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  // Tampilan pratinjau saat file dipilih
  if (file) {
    return (
      <div className="flex items-center justify-between p-2 text-xs rounded-md bg-muted">
        <div className="flex items-center gap-2 truncate">
          {preview && file.type.startsWith("image/") ? (
            <Image
              src={preview}
              alt="preview"
              width={0}
              height={0}
              sizes="100vw"
              className="h-10 w-10 rounded-sm object-cover"
            />
          ) : (
            <FileIcon className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="truncate">{file.name}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRemoveFile}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="outline" size="sm" className={className}>
        <label htmlFor="file-picker-input" className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" /> Lampirkan File
        </label>
      </Button>
      <input
        id="file-picker-input"
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}
