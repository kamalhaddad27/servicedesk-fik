"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSignature } from "@/lib/action/upload.action";
import { Button } from "./button";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
  isSubmitting: boolean;
}

export function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  isSubmitting,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Tampilkan pratinjau
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      const { timestamp, signature } = await getSignature();
      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());

      const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        onUploadComplete(data.secure_url);
      } else {
        throw new Error("Upload gagal.");
      }
    } catch (error) {
      toast.error("Gagal mengupload gambar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-6 pb-4">
      <div className="relative h-24 w-24 rounded-full mb-4">
        {preview ? (
          <Image
            src={preview}
            alt="Profile preview"
            layout="fill"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <Camera className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={isLoading || isSubmitting}
      >
        <label htmlFor="photo-upload">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Mengupload..." : "Ganti Foto"}
        </label>
      </Button>
      <input
        id="photo-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
