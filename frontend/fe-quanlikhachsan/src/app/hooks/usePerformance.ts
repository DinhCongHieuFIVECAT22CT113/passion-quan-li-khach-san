'use client';

import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export const usePerformance = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  // Measure component load time
  const measureLoadTime = useCallback(() => {
    const loadTime = Date.now() - startTimeRef.current;
    console.log(`[Performance] ${componentName} load time: ${loadTime}ms`);
    return loadTime;
  }, [componentName]);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const renderTime = Date.now() - renderStartRef.current;
    console.log(`[Performance] ${componentName} render time: ${renderTime}ms`);
    return renderTime;
  }, [componentName]);

  // Debounce function for performance optimization
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Throttle function for performance optimization
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Lazy loading observer
  const createLazyObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }, []);

  // Image preloader
  const preloadImages = useCallback((imageUrls: string[]) => {
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Memory usage tracker
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`[Performance] ${componentName} memory usage:`, {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  }, [componentName]);

  // Performance observer for Core Web Vitals
  const observeWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`[Performance] LCP: ${lastEntry.startTime}ms`);
    });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming;
        if (eventEntry.processingStart) {
          console.log(`[Performance] FID: ${eventEntry.processingStart - eventEntry.startTime}ms`);
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log(`[Performance] CLS: ${clsValue}`);
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported');
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  // Resource loading optimization
  const optimizeResourceLoading = useCallback(() => {
    // Preload critical resources
    const preloadLink = (href: string, as: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    };

    // Prefetch next page resources
    const prefetchLink = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    };

    return { preloadLink, prefetchLink };
  }, []);

  useEffect(() => {
    renderStartRef.current = Date.now();
    
    // Measure initial render
    const timer = setTimeout(() => {
      measureRenderTime();
      measureLoadTime();
      trackMemoryUsage();
    }, 0);

    // Setup performance observers
    const cleanup = observeWebVitals();

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, [measureRenderTime, measureLoadTime, trackMemoryUsage, observeWebVitals]);

  return {
    measureLoadTime,
    measureRenderTime,
    debounce,
    throttle,
    createLazyObserver,
    preloadImages,
    trackMemoryUsage,
    optimizeResourceLoading
  };
};

// Custom hook for image lazy loading
export const useLazyImage = (src: string, placeholder?: string) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const { createLazyObserver } = usePerformance('LazyImage');

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = createLazyObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = src;
          target.classList.remove('lazy');
          observer?.unobserve(target);
        }
      });
    });

    if (observer) {
      img.src = placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
      img.classList.add('lazy');
      observer.observe(img);
    }

    return () => observer?.disconnect();
  }, [src, placeholder, createLazyObserver]);

  return imgRef;
};

// Custom hook for virtual scrolling
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const { throttle } = usePerformance('VirtualScroll');
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight]);

  const handleScroll = throttle((e: Event) => {
    const target = e.target as HTMLDivElement;
    return getVisibleItems(target.scrollTop);
  }, 16); // 60fps

  return {
    scrollElementRef,
    getVisibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight
  };
};