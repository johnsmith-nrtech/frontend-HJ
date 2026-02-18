"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import "./modern-image-gallery.css";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  Share2,
  Play,
  Pause,
  Grid3X3,
  Info,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageData {
  url: string;
  alt?: string;
  caption?: string;
}

interface ModernImageGalleryProps {
  images: ImageData[];
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  showThumbnails?: boolean;
  showCounter?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableSlideshow?: boolean;
  autoplayInterval?: number;
  onImageChange?: (index: number) => void;
}

export function ModernImageGallery({
  images,
  className,
  aspectRatio = "square",
  showThumbnails = true,
  showCounter = true,
  enableZoom = true,
  enableFullscreen = true,
  enableSlideshow = true,
  autoplayInterval = 3000,
  onImageChange,
}: ModernImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(true);
  const [rotation, setRotation] = useState(0);

  const slideshowRef = useRef<NodeJS.Timeout | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls in fullscreen
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isFullscreen && !isSlideshow) {
        setShowControls(false);
      }
    }, 3000);
  }, [isFullscreen, isSlideshow]);

  useEffect(() => {
    if (isFullscreen) {
      resetControlsTimeout();
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen, resetControlsTimeout]);

  // Navigation functions
  const nextImage = useCallback(() => {
    const newIndex = (selectedImage + 1) % images.length;
    setSelectedImage(newIndex);
    setIsImageLoading(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
    onImageChange?.(newIndex);
  }, [selectedImage, images.length, onImageChange]);

  const prevImage = useCallback(() => {
    const newIndex = (selectedImage - 1 + images.length) % images.length;
    setSelectedImage(newIndex);
    setIsImageLoading(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
    onImageChange?.(newIndex);
  }, [selectedImage, images.length, onImageChange]);

  const goToImage = useCallback(
    (index: number) => {
      setSelectedImage(index);
      setIsImageLoading(true);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setRotation(0);
      onImageChange?.(index);
    },
    [onImageChange]
  );

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) nextImage();
    if (isRightSwipe && images.length > 1) prevImage();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            prevImage();
            break;
          case "ArrowRight":
            e.preventDefault();
            nextImage();
            break;
          case "Escape":
            e.preventDefault();
            setIsFullscreen(false);
            setIsSlideshow(false);
            break;
          case " ":
            e.preventDefault();
            if (enableSlideshow) {
              setIsSlideshow(!isSlideshow);
            }
            break;
          case "+":
          case "=":
            e.preventDefault();
            if (enableZoom) {
              setZoomLevel((prev) => Math.min(prev + 0.5, 3));
            }
            break;
          case "-":
            e.preventDefault();
            if (enableZoom) {
              setZoomLevel((prev) => Math.max(prev - 0.5, 1));
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    prevImage,
    nextImage,
    isSlideshow,
    enableSlideshow,
    enableZoom,
  ]);

  // Slideshow functionality
  useEffect(() => {
    if (isSlideshow && images.length > 1) {
      slideshowRef.current = setInterval(nextImage, autoplayInterval);
    } else {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
      }
    }

    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
      }
    };
  }, [isSlideshow, nextImage, autoplayInterval, images.length]);

  // Zoom and pan functionality
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove2 = (e: React.MouseEvent) => {
    if (dragStart && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!enableZoom || !isFullscreen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel((prev) => Math.max(1, Math.min(3, prev + delta)));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
    setIsZoomed(false);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = images[selectedImage].url;
    link.download = `image-${selectedImage + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this image",
          url: images[selectedImage].url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(images[selectedImage].url);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="bg-muted flex h-64 items-center justify-center rounded-xl">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  }[aspectRatio];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Image Display */}
      <div className="group relative">
        <div
          className={cn(
            "from-muted/20 to-muted/40 relative overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-500",
            aspectRatioClass
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => enableZoom && setIsZoomed(true)}
          onMouseLeave={() => enableZoom && setIsZoomed(false)}
        >
          {/* Loading State */}
          {isImageLoading && (
            <div className="bg-muted/20 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="relative">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
                <div className="border-primary/30 absolute inset-0 h-12 w-12 animate-ping rounded-full border"></div>
              </div>
            </div>
          )}

          {/* Main Image */}
          <Image
            fill
            ref={imageRef}
            src={images[selectedImage]?.url}
            alt={images[selectedImage]?.alt || `Image ${selectedImage + 1}`}
            className={cn(
              "h-full w-full object-cover object-center transition-all duration-700 ease-out",
              isZoomed && enableZoom ? "scale-110 cursor-zoom-in" : "scale-100",
              "group-hover:scale-105"
            )}
            style={
              isZoomed && enableZoom
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : {}
            }
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            onClick={() => enableFullscreen && setIsFullscreen(true)}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-4 -translate-y-1/2 transform bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white hover:shadow-xl"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-4 -translate-y-1/2 transform bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white hover:shadow-xl"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            {enableFullscreen && (
              <Button
                variant="secondary"
                size="icon"
                className="transform bg-white/90 shadow-lg backdrop-blur-sm hover:scale-110 hover:bg-white hover:shadow-xl"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="transform bg-white/90 shadow-lg backdrop-blur-sm hover:scale-110 hover:bg-white hover:shadow-xl"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="transform bg-white/90 shadow-lg backdrop-blur-sm hover:scale-110 hover:bg-white hover:shadow-xl"
              onClick={shareImage}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Counter */}
          {showCounter && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300">
              {selectedImage + 1} / {images.length}
            </div>
          )}

          {/* Image Caption */}
          {images[selectedImage]?.caption && (
            <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-black/60 p-3 text-sm text-white backdrop-blur-sm">
              {images[selectedImage].caption}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Thumbnail Grid */}
      {showThumbnails && images.length > 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                Gallery
              </h3>
              <div className="from-primary/10 to-primary/5 border-primary/20 text-primary rounded-full border bg-gradient-to-r px-4 py-2 text-sm font-semibold">
                {images.length} {images.length === 1 ? "image" : "images"}
              </div>
            </div>
            {enableFullscreen && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary gap-2 transition-all duration-300 hover:scale-105"
                onClick={() => setIsFullscreen(true)}
              >
                <Eye className="h-4 w-4" />
                View All
              </Button>
            )}
          </div>

          {/* Modern Grid Layout with Larger Thumbnails */}
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {images.map((image, i) => (
              <div
                key={i}
                className={cn(
                  "group relative aspect-square cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl",
                  selectedImage === i
                    ? "ring-primary ring-offset-background z-10 scale-105 shadow-2xl ring-3 ring-offset-4"
                    : "hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                )}
                onClick={() => goToImage(i)}
              >
                {/* Image with enhanced loading */}
                <div className="from-muted/50 to-muted/20 relative h-full w-full bg-gradient-to-br">
                  <Image
                    fill
                    src={image.url}
                    alt={image.alt || `Thumbnail ${i + 1}`}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    loading="lazy"
                  />
                </div>

                {/* Enhanced Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

                {/* Selected Indicator with Glow Effect */}
                {selectedImage === i && (
                  <div className="bg-primary/30 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                    <div className="relative">
                      <div className="bg-primary h-6 w-6 animate-pulse rounded-full shadow-2xl" />
                      <div className="bg-primary absolute inset-0 h-6 w-6 animate-ping rounded-full opacity-75" />
                    </div>
                  </div>
                )}

                {/* Image Number with Modern Design */}
                <div className="absolute top-3 left-3 transform rounded-full bg-black/80 px-3 py-2 text-sm font-bold text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                  {i + 1}
                </div>

                {/* Functional Expand Icon */}
                <div className="absolute right-3 bottom-3 translate-y-2 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 border-0 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(i);
                      setIsFullscreen(true);
                    }}
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Subtle Border Glow */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-500",
                    selectedImage === i
                      ? "shadow-primary/50 shadow-[inset_0_0_0_2px_rgb(var(--primary))]"
                      : "group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                  )}
                />
              </div>
            ))}
          </div>

          {/* Enhanced Mobile Instructions */}
          <div className="bg-muted/30 rounded-xl p-4 text-center md:hidden">
            <p className="text-muted-foreground text-sm font-medium">
              💡 <span className="font-semibold">Pro tip:</span> Swipe left or
              right on the main image to navigate • Tap any thumbnail to view
              fullscreen
            </p>
          </div>
        </div>
      )}

      {/* True Fullscreen Lightbox */}
      {isFullscreen && (
        <div
          ref={fullscreenRef}
          className="fullscreen-overlay bg-black/95 backdrop-blur-xl"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove2(e);
            resetControlsTimeout();
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={resetControlsTimeout}
        >
          {/* Enhanced Top Controls */}
          <div
            className={cn(
              "absolute top-0 right-0 left-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-6 transition-all duration-500",
              showControls
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            )}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex gap-3">
                {enableSlideshow && images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                    onClick={() => setIsSlideshow(!isSlideshow)}
                  >
                    {isSlideshow ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                )}
                {enableZoom && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                      onClick={() =>
                        setZoomLevel((prev) => Math.min(prev + 0.5, 3))
                      }
                      disabled={zoomLevel >= 3}
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                      onClick={() =>
                        setZoomLevel((prev) => Math.max(prev - 0.5, 1))
                      }
                      disabled={zoomLevel <= 1}
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    {zoomLevel > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                        onClick={resetZoom}
                      >
                        Reset
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={() => setShowThumbnailStrip(!showThumbnailStrip)}
                >
                  <Grid3X3 className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={downloadImage}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={shareImage}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  onClick={() => setIsFullscreen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Image Info Panel */}
            {showInfo && (
              <div className="animate-in slide-in-from-top mx-auto mt-4 max-w-7xl rounded-xl bg-black/60 p-4 text-white backdrop-blur-sm duration-300">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Image:</span>{" "}
                    {selectedImage + 1} of {images.length}
                  </div>
                  <div>
                    <span className="text-white/70">Zoom:</span>{" "}
                    {Math.round(zoomLevel * 100)}%
                  </div>
                  {images[selectedImage]?.alt && (
                    <div className="col-span-2">
                      <span className="text-white/70">Alt:</span>{" "}
                      {images[selectedImage].alt}
                    </div>
                  )}
                  {images[selectedImage]?.caption && (
                    <div className="col-span-2">
                      <span className="text-white/70">Caption:</span>{" "}
                      {images[selectedImage].caption}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Navigation in Lightbox */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-1/2 left-6 z-50 h-16 w-16 -translate-y-1/2 rounded-full text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20",
                  showControls ? "opacity-100" : "opacity-0"
                )}
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-1/2 right-6 z-50 h-16 w-16 -translate-y-1/2 rounded-full text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20",
                  showControls ? "opacity-100" : "opacity-0"
                )}
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Lightbox Image */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12">
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                fill
                src={images[selectedImage]?.url}
                alt={images[selectedImage]?.alt || `Image ${selectedImage + 1}`}
                className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    imagePosition.x / zoomLevel
                  }px, ${
                    imagePosition.y / zoomLevel
                  }px) rotate(${rotation}deg)`,
                  cursor: zoomLevel > 1 ? "grab" : "default",
                  maxHeight: "calc(100vh - 200px)",
                  maxWidth: "calc(100vw - 200px)",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Enhanced Bottom Controls */}
          <div
            className={cn(
              "absolute right-0 bottom-0 left-0 z-50 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 transition-all duration-500",
              showControls
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            )}
          >
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
              {/* Counter */}
              {showCounter && images.length > 1 && (
                <div className="rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm">
                  {selectedImage + 1} of {images.length}
                </div>
              )}

              {/* Enhanced Lightbox Thumbnails */}
              {showThumbnailStrip && showThumbnails && images.length > 1 && (
                <div className="scrollbar-hide flex max-w-full gap-2 overflow-x-auto px-4">
                  {images.map((image, i) => (
                    <div
                      key={i}
                      className={cn(
                        "group relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 md:h-14 md:w-14",
                        selectedImage === i
                          ? "scale-110 border-white shadow-xl ring-2 ring-white/30"
                          : "border-white/30 hover:scale-105 hover:border-white/70"
                      )}
                      onClick={() => goToImage(i)}
                    >
                      <Image
                        fill
                        src={image.url}
                        alt={image.alt || `Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      {selectedImage === i && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute right-0.5 bottom-0.5 left-0.5 text-center">
                        <span className="rounded bg-black/60 px-1 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slideshow Indicator */}
          {isSlideshow && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-red-500/80 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              Slideshow Active
            </div>
          )}
        </div>
      )}
    </div>
  );
}
