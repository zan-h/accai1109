// SmoothScroll.tsx - Smooth inertial scrolling wrapper
'use client';

import { useEffect } from 'react';
import { useResponsive } from './layouts/ResponsiveLayout';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsive();

  useEffect(() => {
    // Disable on mobile for native feel and performance
    if (isMobile) return;

    let locomotiveScroll: any;

    const initScroll = async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        
        locomotiveScroll = new LocomotiveScroll({
          lenisOptions: {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.1,
            duration: 1.2,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
          },
          scrollCallback: () => {
            // Optional: dispatch event for other components if needed
          }
        });
      } catch (error) {
        console.warn('Locomotive Scroll failed to initialize:', error);
      }
    };

    initScroll();

    return () => {
      if (locomotiveScroll) {
        locomotiveScroll.destroy();
      }
    };
  }, [isMobile]);

  return <>{children}</>;
}

