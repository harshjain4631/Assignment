// Drag-and-drop (or click) image upload for ingredient recognition.
"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

export function ImageUpload({ onIngredientsDetected }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert a file to base64 and show preview.
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    // Max 10MB.
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setError(null);

    // Create preview URL.
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Convert to base64 for the API.
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsProcessing(true);

      try {
        const res = await fetch("/api/ingredients/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        if (!res.ok) throw new Error("Recognition failed");

        const data = await res.json();
        // Extract ingredient names from the response.
        const names = data.ingredients.map(
          (ing: { name: string }) => ing.name.toLowerCase()
        );
        onIngredientsDetected(names);
      } catch {
        setError("Failed to recognize ingredients. Try again.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [onIngredientsDetected]);

  // Drag-and-drop handlers.
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // Clear the current image.
  function clearImage() {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${preview ? "py-4" : "py-8"}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
          className="hidden"
        />

        {preview ? (
          // Show preview with processing overlay.
          <div className="relative w-full max-w-xs">
            <img
              src={preview}
              alt="Uploaded ingredients"
              className="w-full rounded-md object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm font-medium">Analyzing...</span>
              </div>
            )}
            {!isProcessing && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Upload prompt.
          <>
            <div className="rounded-full bg-muted p-3">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Upload a photo of ingredients</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to upload
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
