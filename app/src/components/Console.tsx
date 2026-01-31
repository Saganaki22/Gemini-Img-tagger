import { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Minimize2, Maximize2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LogEntry } from '@/types';

const FONT_SIZES = [10, 12, 14, 16, 18];

interface ConsoleProps {
  logs: LogEntry[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function Console({ logs, isExpanded, onToggleExpand }: ConsoleProps) {
  const [fontSizeIndex, setFontSizeIndex] = useState(2);
  const [copied, setCopied] = useState(false);
  const [minimizedHeight, setMinimizedHeight] = useState(96);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = async () => {
    const text = logs
      .map(
        (log) =>
          `[${log.timestamp.toLocaleTimeString()}] [${log.type.toUpperCase()}] ${log.message}`
      )
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-amber-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-green-500';
    }
  };

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaY = startY.current - e.clientY;
      const newHeight = Math.max(80, Math.min(400, startHeight.current + deltaY));
      setMinimizedHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = minimizedHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const consoleContent = (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto console-text p-3"
      style={{ fontSize: `${FONT_SIZES[fontSizeIndex]}px` }}
    >
      {logs.length === 0 ? (
        <p className="text-muted-foreground opacity-50">No logs yet...</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className={cn('mb-1', getLogColor(log.type))}>
            <span className="opacity-50">
              [{log.timestamp.toLocaleTimeString()}]
            </span>{' '}
            {log.message}
          </div>
        ))
      )}
    </div>
  );

  // Minimized view
  if (!isExpanded) {
    return (
      <div
        className={cn(
          'bg-black/80 border border-border rounded-lg overflow-hidden',
          'transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
          'group relative'
        )}
      >
        <div 
          onClick={onToggleExpand}
          className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Live Console</span>
          </div>
          <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div
          className="overflow-hidden console-text p-3 text-xs opacity-70"
          style={{ 
            height: `${minimizedHeight}px`,
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
          }}
        >
          {logs.slice(-10).map((log) => (
            <div key={log.id} className={cn('mb-0.5 truncate', getLogColor(log.type))}>
              <span className="opacity-50">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
              {log.message}
            </div>
          ))}
        </div>
        {/* Resize handle */}
        <div
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors flex items-center justify-center"
        >
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>
    );
  }

  // Expanded modal view
  return (
    <div
      className="fixed -top-4 left-0 right-0 bottom-0 z-[60] flex items-center justify-center p-4 modal-backdrop bg-black/90 animate-fade-in"
      onClick={onToggleExpand}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-4xl h-[80vh] flex flex-col animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-semibold">Live Request Console</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-2 mr-4">
              <Type className="h-3 w-3 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={FONT_SIZES.length - 1}
                value={fontSizeIndex}
                onChange={(e) => setFontSizeIndex(parseInt(e.target.value))}
                className="font-size-slider w-24"
              />
              <Type className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleExpand}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {consoleContent}
      </div>
    </div>
  );
}
