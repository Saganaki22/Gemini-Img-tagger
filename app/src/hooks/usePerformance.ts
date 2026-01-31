import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVirtualizationOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  style: {
    position: 'absolute';
    top: number;
    left: number;
    right: number;
    height: number;
  };
}

export function useVirtualization({
  itemCount,
  itemHeight,
  overscan = 5,
}: UseVirtualizationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const virtualItems = useCallback((): VirtualItem[] => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(itemCount, startIndex + visibleCount + overscan * 2);

    const items: VirtualItem[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    return items;
  }, [scrollTop, itemHeight, itemCount, containerHeight, overscan]);

  const totalHeight = itemCount * itemHeight;

  return {
    containerRef,
    virtualItems: virtualItems(),
    totalHeight,
    scrollTop,
  };
}

export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    }) as T,
    [callback, delay]
  );
}

export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

interface UseWebWorkerOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useWebWorker(workerScript: string, options: UseWebWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const { onMessage, onError } = options;

  useEffect(() => {
    const worker = new Worker(workerScript);
    workerRef.current = worker;

    worker.onmessage = (e) => {
      onMessage?.(e.data);
    };

    worker.onerror = (error) => {
      onError?.(error);
    };

    return () => {
      worker.terminate();
    };
  }, [workerScript, onMessage, onError]);

  const postMessage = useCallback((data: any) => {
    workerRef.current?.postMessage(data);
  }, []);

  return { postMessage };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memory, setMemory] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    // Only works in Chrome
    const checkMemory = () => {
      const perf = performance as any;
      if (perf.memory) {
        setMemory({
          used: perf.memory.usedJSHeapSize / 1048576, // MB
          total: perf.memory.totalJSHeapSize / 1048576,
          percentage: (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100,
        });
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory();

    return () => clearInterval(interval);
  }, []);

  return memory;
}
