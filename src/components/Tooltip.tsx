"use client";
import { ReactNode, useState, useEffect, useRef } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!open) return;
    
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    // Add both mouse and touch event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick);
    
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open]);

  useEffect(() => {
    // Position tooltip to prevent overflow on mobile
    if (open && isMobile && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (rect.right > viewportWidth - 10) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0';
        tooltip.style.transform = 'none';
      } else if (rect.left < 10) {
        tooltip.style.left = '0';
        tooltip.style.right = 'auto';
        tooltip.style.transform = 'none';
      }
    }
  }, [open, isMobile]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobile) {
      // On mobile, only respond to touch events
      if (e.type === 'touchend') {
        setOpen(prev => !prev);
      }
    } else {
      // On desktop, respond to mouse events
      if (e.type === 'click') {
        setOpen(prev => !prev);
      }
    }
  };

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={!isMobile ? () => setOpen(true) : undefined}
      onMouseLeave={!isMobile ? () => setOpen(false) : undefined}
      onClick={!isMobile ? handleInteraction : undefined}
      onTouchEnd={isMobile ? handleInteraction : undefined}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      {open && (
        <span 
          ref={tooltipRef}
          className={`absolute bottom-full mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 max-w-xs ${
            isMobile 
              ? 'left-1/2 -translate-x-1/2 whitespace-normal break-words' 
              : 'left-1/2 -translate-x-1/2 whitespace-nowrap'
          }`}
        >
          {content}
          {/* Arrow pointing down */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
        </span>
      )}
    </span>
  );
}