'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || null);
  const [isImgError, setIsImgError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderImg = "/no-image.jpg";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Handle keyboard for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 font-serif italic border-2 border-dashed border-gray-100">
        Hiện chưa có hình ảnh cho sản phẩm này
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in zoom-in-95 duration-1000">
      {/* Main Container */}
      <div className="relative group">
          {/* Main Viewer */}
          <div 
            ref={containerRef}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-white border border-gray-100 relative cursor-zoom-in transition-all duration-700 shadow-[0_30px_100px_rgba(128,0,32,0.08)] group-hover:shadow-[0_30px_100px_rgba(128,0,32,0.15)]"
          >
            <div 
              className={`w-full h-full transition-transform duration-500 ease-out ${isZoomed ? 'scale-[2.5]' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
            >
              <Image 
                src={isImgError ? placeholderImg : (activeImage?.image_path || placeholderImg)} 
                alt={productName} 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={() => setIsImgError(true)}
              />
            </div>

            {/* Premium Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <button 
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-8 right-8 p-4 bg-white/90 backdrop-blur-md text-[#800020] rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#800020] hover:text-[#D4AF37]"
            >
                <Maximize2 size={20} />
            </button>

            {activeImage?.is_primary && (
                <div className="absolute top-8 left-8 bg-[#800020] text-[#D4AF37] px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl z-20">
                    Sản phẩm tiêu biểu
                </div>
            )}
          </div>
      </div>

      {/* Thumbnails Navigation */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => {
                  setActiveImage(img);
                  setIsImgError(false);
              }}
              className={`relative flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-700
                ${activeImage?.id === img.id 
                    ? 'border-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.2)] scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'}
              `}
            >
              <Image 
                src={img.image_path} 
                alt={`${productName} thumbnail`} 
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
          <div className="fixed inset-0 z-[9999] bg-white/98 backdrop-blur-xl animate-in fade-in duration-500 flex flex-col items-center justify-center p-4">
              <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-8 right-8 p-4 text-[#800020] hover:scale-110 transition-transform"
              >
                  <X size={32} strokeWidth={1} />
              </button>
              
              <div className="relative w-full max-w-4xl aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image 
                    src={activeImage?.image_path || placeholderImg} 
                    alt={productName} 
                    fill
                    className="object-cover"
                />
              </div>

              <div className="mt-8 flex items-center gap-6">
                  {images.map((img) => (
                      <button 
                        key={img.id}
                        onClick={() => setActiveImage(img)}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${activeImage?.id === img.id ? 'bg-[#D4AF37] scale-150' : 'bg-gray-200'}`}
                      />
                  ))}
              </div>
          </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
