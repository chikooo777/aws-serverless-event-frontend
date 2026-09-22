import React, { useEffect, useState } from 'react';

/**
 * Ambient Glassmorphism Background with Interactive Mouse Spotlight
 * Renders floating aurora orbs, subtle cyber-mesh texture, and dynamic cursor glow
 */
export default function GlassBackground() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isPointerDevice, setIsPointerDevice] = useState(true);

  useEffect(() => {
    // Check if device has fine pointer (mouse) vs touch
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
      {/* Dynamic Animated Aurora Orbs */}
      <div className="ambient-orb orb-amber" />
      <div className="ambient-orb orb-cyan" />
      <div className="ambient-orb orb-purple" />
      <div className="ambient-orb orb-mint" />

      {/* Futuristic Cyber-Mesh Blueprint Grid */}
      <div className="grid-texture-overlay" />

      {/* Interactive Mouse Spotlight Aura (only for fine pointer) */}
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
