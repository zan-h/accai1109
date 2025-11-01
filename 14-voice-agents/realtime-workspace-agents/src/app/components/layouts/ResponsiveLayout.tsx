"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Device type based on screen size
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Screen orientation
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Responsive context value
 */
export interface ResponsiveContextValue {
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Responsive context for device detection
 */
const ResponsiveContext = createContext<ResponsiveContextValue>({
  deviceType: 'desktop',
  orientation: 'landscape',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  width: 1280,
  height: 800,
});

/**
 * Hook to access responsive context
 */
export const useResponsive = () => useContext(ResponsiveContext);

/**
 * Determine device type based on window width
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 */
const getDeviceType = (width: number): DeviceType => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Determine orientation based on window dimensions
 */
const getOrientation = (width: number, height: number): Orientation => {
  return height > width ? 'portrait' : 'landscape';
};

/**
 * ResponsiveLayout wrapper component
 * Detects screen size and orientation, provides context to children
 */
export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with safe defaults (will update on mount)
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Update dimensions on mount
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial measurement
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateDimensions);

    // Cleanup listeners
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Compute device type and orientation
  const deviceType = getDeviceType(dimensions.width);
  const orientation = getOrientation(dimensions.width, dimensions.height);

  // Convenience flags
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  const contextValue: ResponsiveContextValue = {
    deviceType,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    width: dimensions.width,
    height: dimensions.height,
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

/**
 * Example usage:
 * 
 * // Wrap app with ResponsiveLayout
 * <ResponsiveLayout>
 *   <App />
 * </ResponsiveLayout>
 * 
 * // Use responsive context in components
 * const { isMobile, isTablet, deviceType } = useResponsive();
 * 
 * return (
 *   <div>
 *     {isMobile && <MobileView />}
 *     {isTablet && <TabletView />}
 *     {isDesktop && <DesktopView />}
 *   </div>
 * );
 */

