"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingImages?: File[];
  disabled?: boolean;
}

export function ImageUpload({
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  existingImages = [],
  disabled = false,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter(
      (file) => !acceptedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Please upload only image files (JPEG, PNG, WebP)");
      return;
    }

    // Validate file sizes (max 5MB per file)
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    if (disabled) return;

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            onClick={handleUploadClick}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-primary/5"} border-muted-foreground/25`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-muted rounded-full p-4">
                <Upload className="text-muted-foreground h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Click to select images</p>
                <p className="text-muted-foreground text-sm">
                  Upload up to {maxFiles} images (JPEG, PNG, WebP, max 5MB each)
                </p>
              </div>
              <Button type="button" variant="outline" disabled={disabled}>
                <Upload className="mr-2 h-4 w-4" />
                Select Images
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected Images</h4>
                <Badge variant="secondary">{files.length} files</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="group bg-muted/50 relative rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-md">
                          <ImageIcon className="text-primary h-6 w-6" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
