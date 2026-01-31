import { useState, useRef, useCallback } from 'react';
import { Play, Pause, Square, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProcessingState } from '@/types';

interface BatchControlsProps {
  state: ProcessingState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onDeleteAll: () => void;
  onExportZip: () => void;
  selectedCount: number;
  totalCount: number;
  completedCount: number;
  canExport: boolean;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  elapsedTime: number;
  estimatedTimeRemaining: number | null;
}

export function BatchControls({
  state,
  onStart,
  onPause,
  onStop,
  onDeleteAll,
  onExportZip,
  selectedCount,
  totalCount,
  completedCount,
  canExport,
  batchSize,
  onBatchSizeChange,
  elapsedTime,
  estimatedTimeRemaining,
}: BatchControlsProps) {
  const [isHoldingDelete, setIsHoldingDelete] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startDeleteHold = useCallback(() => {
    if (totalCount === 0) return;
    
    setIsHoldingDelete(true);
    setDeleteCountdown(4);
    startTimeRef.current = Date.now();

    const updateCountdown = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 4 - elapsed);
      setDeleteCountdown(remaining);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(updateCountdown);
      }
    };

    rafRef.current = requestAnimationFrame(updateCountdown);

    timerRef.current = setTimeout(() => {
      onDeleteAll();
      setIsHoldingDelete(false);
      setDeleteCountdown(4);
    }, 4000);
  }, [totalCount, onDeleteAll]);

  const cancelDeleteHold = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsHoldingDelete(false);
    setDeleteCountdown(4);
  }, []);

  const getButtonText = () => {
    if (selectedCount > 0) {
      return `Start Selected (${selectedCount})`;
    }
    return 'Start Batch';
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Time Display */}
      {state === 'running' && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Elapsed: {formatTime(elapsedTime)}</span>
          {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 ? (
            <span>Est. remaining: {formatTime(estimatedTimeRemaining)}</span>
          ) : estimatedTimeRemaining === null && elapsedTime > 5 ? (
            <span className="animate-pulse">Calculating...</span>
          ) : null}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Batch Size Input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Batch Size (images per request)
        </label>
        <Input
          type="number"
          min={1}
          max={100}
          value={batchSize}
          onChange={(e) => onBatchSizeChange(Math.max(1, Math.min(100, parseInt(e.target.value) || 5)))}
          className="bg-secondary/50 border-border"
          disabled={state === 'running'}
        />
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Start/Pause Button */}
        {state === 'running' ? (
          <Button
            variant="outline"
            className="gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
            onClick={onPause}
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onStart}
            disabled={totalCount === 0 || (selectedCount === 0 && completedCount === totalCount && totalCount > 0)}
          >
            <Play className="h-4 w-4" />
            {getButtonText()}
          </Button>
        )}

        {/* Stop Button - only shown when running */}
        <Button
          variant="outline"
          className={cn(
            'gap-2 border-destructive/50 text-destructive hover:bg-destructive/10',
            state !== 'running' && 'opacity-50 cursor-not-allowed'
          )}
          onClick={onStop}
          disabled={state !== 'running'}
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      </div>

      {/* Delete & Export Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Delete Button with Hold - Red background, white text, breathing animation */}
        <button
          className={cn(
            'relative overflow-hidden rounded-md font-medium text-sm transition-all',
            'flex items-center justify-center gap-2 h-10 px-4',
            isHoldingDelete
              ? 'bg-red-600 text-white animate-breathe-red'
              : 'bg-red-500 text-white hover:bg-red-600'
          )}
          onMouseDown={startDeleteHold}
          onMouseUp={cancelDeleteHold}
          onMouseLeave={cancelDeleteHold}
          onTouchStart={startDeleteHold}
          onTouchEnd={cancelDeleteHold}
          disabled={totalCount === 0 || state === 'running'}
        >
          {/* Progress fill animation */}
          {isHoldingDelete && (
            <div 
              className="absolute inset-0 bg-red-700 transition-all"
              style={{ 
                clipPath: `inset(0 ${100 - ((4 - deleteCountdown) / 4) * 100}% 0 0)` 
              }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {isHoldingDelete
              ? `Release in ${deleteCountdown.toFixed(1)}s`
              : selectedCount > 0
              ? `Delete (${selectedCount})`
              : 'Delete All'}
          </span>
        </button>

        {/* Export ZIP Button */}
        <Button
          variant="outline"
          className="gap-2 border-border hover:border-primary/50 hover:bg-primary hover:text-black group"
          onClick={onExportZip}
          disabled={!canExport || state === 'running'}
        >
          <Archive className="h-4 w-4 group-hover:text-black" />
          <span className="group-hover:text-black">
            {selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export ZIP'}
          </span>
        </Button>
      </div>
    </div>
  );
}
