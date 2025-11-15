"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Maximize2,
  Minimize2,
  Download,
  Share2,
} from "lucide-react";

interface ViewInRoomProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
  currentImageIndex: number;
  images: Array<{ url: string; alt?: string }>;
  onImageChange: (index: number) => void;
}

export default function ViewInRoom({
  isOpen,
  onClose,
  productImage,
  productName,
  currentImageIndex,
  images,
  onImageChange,
}: ViewInRoomProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset all transformations when modal closes
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    // Simulate download functionality
    const link = document.createElement("a");
    link.href = productImage;
    link.download = `${productName}-room-view.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - Room View`,
          text: `Check out this ${productName} in room view`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className={cn(
          "relative flex flex-col overflow-hidden bg-white transition-all duration-300",
          isFullscreen ? "h-full w-full" : "h-[90vh] w-[90vw] max-w-6xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {productName}
            </h3>
            <p className="text-sm text-gray-600">Room View Simulation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleDownload}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-gray-600" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image Viewer */}
          <div className="relative flex-1 overflow-hidden bg-gray-100">
            <div
              ref={containerRef}
              className="flex h-full w-full cursor-move items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                ref={imageRef}
                className="relative transition-transform duration-200 ease-out"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <Image
                  src={productImage}
                  alt={`${productName} in room view`}
                  width={800}
                  height={600}
                  className="max-h-full max-w-full object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* Zoom Info */}
            <div className="bg-opacity-50 absolute top-4 left-4 rounded-full bg-black px-3 py-1 text-sm text-white">
              {Math.round(zoom * 100)}%
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ZoomOut className="h-4 w-4 text-gray-600" />
              </button>

              <div className="min-w-[60px] px-3 py-2 text-center text-sm font-medium text-gray-700">
                {Math.round(zoom * 100)}%
              </div>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </button>

              <div className="mx-1 h-6 w-px bg-gray-300" />

              <button
                onClick={handleRotate}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 text-gray-600" />
              </button>

              <button
                onClick={handleReset}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
              >
                <Move className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Image Selector Sidebar */}
          <div className="flex w-80 flex-col border-l bg-gray-50">
            <div className="border-b p-4">
              <h4 className="mb-2 font-semibold text-gray-900">
                Product Views
              </h4>
              <p className="text-sm text-gray-600">
                Select different angles and views
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onImageChange(index)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      currentImageIndex === index
                        ? "ring-2 ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {currentImageIndex === index && (
                      <div className="bg-opacity-10 absolute inset-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="border-t bg-white p-4">
              <h5 className="mb-2 font-medium text-gray-900">How to Use:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Scroll to zoom in/out</li>
                <li>• Drag to pan when zoomed</li>
                <li>• Click rotate to change angle</li>
                <li>• Use reset to center view</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
