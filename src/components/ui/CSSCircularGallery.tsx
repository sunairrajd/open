'use client';

import { useRef, useEffect, useState } from 'react';

interface CSSCircularGalleryProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export default function CSSCircularGallery({
  items = [],
  bend = 3,
  textColor = "#000000",
  borderRadius = 0.05,
  font = "bold 16px DM Sans",
  imageWidth = 300,
  imageHeight = 533,
}: CSSCircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const defaultItems = [
    { image: "/property-1.jpg", text: "₹2.4 Crore • JP Nagar" },
    { image: "/property-1.jpg", text: "₹3.1 Crore • Indiranagar" },
    { image: "/property-1.jpg", text: "₹1.8 Crore • Koramangala" },
    { image: "/property-1.jpg", text: "₹4.2 Crore • Whitefield" },
    { image: "/property-1.jpg", text: "₹2.9 Crore • HSR Layout" },
    { image: "/property-1.jpg", text: "₹3.5 Crore • Richmond Town" },
    { image: "/property-1.jpg", text: "₹2.2 Crore • Jayanagar" },
    { image: "/property-1.jpg", text: "₹1.9 Crore • Electronic City" },
  ];

  const galleryItems = items.length > 0 ? items : defaultItems;
  const duplicatedItems = [...galleryItems, ...galleryItems, ...galleryItems]; // Triple for seamless loop

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    // Set initial scroll position
    const itemWidth = imageWidth * 0.6 + 60;
    const totalWidth = itemWidth * duplicatedItems.length;
    setScrollPosition(totalWidth / 3); // Start from 1/3 since items are tripled
  }, [imageWidth, duplicatedItems.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || !isHydrated) return;

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const itemWidth = imageWidth * 0.6 + 60;
        const totalWidth = itemWidth * duplicatedItems.length;
        const newPos = prev + 1;
        
        // Reset position when we've scrolled through one full set
        if (newPos >= (totalWidth * 2) / 3) {
          return totalWidth / 3;
        }
        return newPos;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isAutoScrolling, isHydrated, imageWidth, duplicatedItems.length]);

  // Handle mouse/touch events
  const handleStart = (clientX: number) => {
    setIsAutoScrolling(false);
    setIsDragging(true);
    setStartX(clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = (startX - clientX) * 0.8;
    setScrollPosition(startScrollPosition + deltaX);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setTimeout(() => setIsAutoScrolling(true), 2000);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Wheel event
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScrollPosition(prev => prev + e.deltaY * 0.5);
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 2000);
  };

  // Don't render dynamic content until hydrated
  if (!isHydrated) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading gallery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <style jsx>{`
        .gallery-container {
          width: 100%;
          height: 100%;
          position: relative;
          perspective: 1200px;
          perspective-origin: center center;
        }
        
        .gallery-track {
          display: flex;
          align-items: center;
          height: 100%;
          transition: transform 0.1s ease-out;
          transform-style: preserve-3d;
        }
        
        .gallery-item {
          flex-shrink: 0;
          width: ${imageWidth * 0.6}px;
          height: ${imageHeight * 0.6}px;
          margin-right: 60px;
          cursor: grab;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }
        
        .gallery-item:active {
          cursor: grabbing;
        }
        
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: ${borderRadius * 100}px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: box-shadow 0.3s ease;
          transform-style: preserve-3d;
        }
        
        .gallery-item:hover img {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }
      `}</style>
      
      <div
        ref={containerRef}
        className="gallery-container cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className="gallery-track"
          style={{
            transform: `translateX(${-scrollPosition}px)`,
          }}
        >
          {duplicatedItems.map((item, index) => {
            // Calculate item position relative to viewport center
            const itemWidth = imageWidth * 0.6 + 60;
            const itemPosition = index * itemWidth - scrollPosition;
            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
            const viewportCenter = viewportWidth / 2;
            const itemCenter = itemPosition + (imageWidth * 0.6) / 2;
            
            // Calculate distance from center (-1 to 1, where 0 is center)
            const distanceFromCenter = (itemCenter - viewportCenter) / (viewportWidth / 2);
            const clampedDistance = Math.max(-1, Math.min(1, distanceFromCenter));
            
            // Calculate rotation based on distance from center
            const maxRotationY = 45; // Maximum Y rotation in degrees
            const maxRotationX = 15; // Maximum X rotation in degrees
            const maxTranslateZ = 50; // Maximum Z translation in pixels
            
            const rotationY = -clampedDistance * maxRotationY; // Negative to rotate inward
            const rotationX = Math.abs(clampedDistance) * maxRotationX * (clampedDistance > 0 ? -1 : 1);
            const translateZ = Math.abs(clampedDistance) * maxTranslateZ;
            const scale = 1.05 - Math.abs(clampedDistance) * 0.35; // Center at 105%, edges at 70%
            const opacity = 1 - Math.abs(clampedDistance) * 0.3; // Fade items further from center
            
            return (
              <div
                key={`${index}-${item.text}`}
                className="gallery-item"
                style={{
                  transform: `rotateY(${rotationY.toFixed(2)}deg) rotateX(${rotationX.toFixed(2)}deg) translateZ(${translateZ.toFixed(2)}px) scale(${scale.toFixed(3)})`,
                  opacity: opacity.toFixed(3),
                }}
              >
                <img
                  src={item.image}
                  alt={item.text}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 