import React, { useEffect, useState } from 'react';

/**
 * Minimalist Pearl Glassmorphic Ambient Canvas
 * Soft pearly misty orbs and subtle slate micro-mesh overlay
 */
export default function GlassBackground() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isPointerDevice, setIsPointerDevice] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsPointerDevice(false);
      return;
    }

    let rafId;
    const handleMouseMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="glass-backdrop-wrapper" aria-hidden="true">
      {/* Soft Pearl & Misty Slate Ambient Floating Clouds */}
      <div className="ambient-orb orb-pearl-1" />
      <div className="ambient-orb orb-pearl-2" />
      <div className="ambient-orb orb-pearl-3" />

      {/* Subtle Micro-Grid Blueprint Texture */}
      <div className="grid-texture-overlay" />

      {/* Soft Mouse Spotlight (Specular Highlight) */}
      {isPointerDevice && (
        <div
          className="mouse-interactive-spotlight"
          style={{
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          }}
        />
      )}
    </div>
  );
}
