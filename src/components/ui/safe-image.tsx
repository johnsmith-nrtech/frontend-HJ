"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

const SafeImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackSrc = "/placeholder.svg",
  onError,
}: SafeImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Validate and clean the image URL
  const getValidImageUrl = (url: string): string => {
    try {
      if (!url || typeof url !== "string") {
        return fallbackSrc;
      }

      // Remove any extra whitespace
      const cleanUrl = url.trim();

      // Check if it's a valid URL or relative path
      if (cleanUrl.startsWith("http") || cleanUrl.startsWith("/")) {
        return cleanUrl;
      }

      // If it doesn't start with http or /, assume it's invalid
      return fallbackSrc;
    } catch (error) {
      console.warn("Error validating image URL:", error);
      return fallbackSrc;
    }
  };

  const handleError = () => {
    if (!hasError) {
      console.warn("Image failed to load:", imageSrc);
      setImageSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    }
  };

  const validSrc = getValidImageUrl(imageSrc);

  return (
    <Image
      src={validSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={false}
      loading="lazy"
    />
  );
};

export default SafeImage;
