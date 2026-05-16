'use client';

import { useEffect } from 'react';

interface Branding {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export default function BrandingProvider() {
  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch('/api/branding');
        if (!res.ok) return;

        const data: Branding = await res.json();

        const root = document.documentElement;

        if (data.primaryColor) {
          // Convert hex to HSL for Tailwind compatibility
          const hsl = hexToHsl(data.primaryColor);
          root.style.setProperty('--brand-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        }

        if (data.secondaryColor) {
          const hsl = hexToHsl(data.secondaryColor);
          root.style.setProperty('--brand-secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        }
      } catch (e) {
        // Silent fail - use default colors
      }
    }

    loadBranding();
  }, []);

  return null;
}

// Simple hex to HSL converter
function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
