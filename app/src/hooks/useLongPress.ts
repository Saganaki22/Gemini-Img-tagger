import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onCancel?: () => void;
  duration?: number;
  onProgress?: (progress: number) => void;
}

export function useLongPress({
  onLongPress,
  onCancel,
  duration = 1000,
  onProgress,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isPressedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isPressedRef.current = false;
  }, []);

  const updateProgress = useCallback(() => {
    if (!isPressedRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(100, (elapsed / duration) * 100);
    onProgress?.(progress);

    if (elapsed < duration) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [duration, onProgress]);

  const start = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      isPressedRef.current = true;
      startTimeRef.current = Date.now();
      onProgress?.(0);

      timerRef.current = setTimeout(() => {
        clearTimer();
        onLongPress();
      }, duration);

      rafRef.current = requestAnimationFrame(updateProgress);
    },
    [onLongPress, duration, onProgress, clearTimer, updateProgress]
  );

  const cancel = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (isPressedRef.current) {
        clearTimer();
        onCancel?.();
        onProgress?.(0);
      }
    },
    [onCancel, onProgress, clearTimer]
  );

  const bind = {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  return bind;
}
