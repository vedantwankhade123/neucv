import { useState, useEffect } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

interface GridConfig {
  columns: number;
  gap: string;
  minCardWidth: number;
}

export const useResponsiveGrid = (minCardWidth: number = 280): GridConfig => {
  const { isCollapsed } = useSidebar();
  const [columns, setColumns] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    // Sidebar widths: collapsed = 80px (w-20), expanded = 288px (w-72)
    const sidebarWidth = isCollapsed ? 80 : 288;
    const availableWidth = windowWidth - sidebarWidth;
    
    // Calculate optimal number of columns based on available width and min card width
    // Account for padding (p-8 = 64px total) and gaps
    const padding = 64; // 32px on each side
    const gap = 32; // gap-8 = 32px
    const usableWidth = availableWidth - padding;
    
    // Calculate columns: (usableWidth + gap) / (minCardWidth + gap)
    const calculatedColumns = Math.max(1, Math.floor((usableWidth + gap) / (minCardWidth + gap)));
    
    // Apply responsive breakpoints for better UX
    let finalColumns = calculatedColumns;
    
    if (windowWidth < 640) {
      finalColumns = 1;
    } else if (windowWidth < 1024) {
      finalColumns = Math.min(2, calculatedColumns);
    } else if (windowWidth < 1280) {
      finalColumns = Math.min(3, calculatedColumns);
    } else if (windowWidth < 1536) {
      finalColumns = Math.min(4, calculatedColumns);
    } else {
      finalColumns = Math.min(5, calculatedColumns);
    }
    
    setColumns(finalColumns);
  }, [windowWidth, isCollapsed, minCardWidth]);

  return {
    columns,
    gap: 'gap-8',
    minCardWidth,
  };
};

