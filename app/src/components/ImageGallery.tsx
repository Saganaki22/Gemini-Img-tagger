import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Download, RefreshCw, X, FileText, Check, Maximize2, ChevronLeft, ChevronRight, Grid3X3, Grid2X2, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ImageItem } from '@/types';
import { useLongPress } from '@/hooks/useLongPress';
import { useThrottledCallback } from '@/hooks/usePerformance';

type ViewMode = 'grid-3' | 'grid-6' | 'list';
type SortOrder = 'asc' | 'desc';

interface ImageGalleryProps {
  images: ImageItem[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string, isCtrlPressed: boolean) => void;
  onDelete: (id: string) => void;
  onRerun: (id: string) => void;
  onUpdateResult: (id: string, result: string) => void;
  isProcessing: boolean;
}

interface ImageModalProps {
  image: ImageItem;
  images: ImageItem[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onUpdateResult: (id: string, result: string) => void;
  onRerun: (id: string) => void;
}

function ImageModal({ image, images, onClose, onNavigate, onUpdateResult, onRerun }: ImageModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(image.result || '');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  const handleSaveEdit = () => {
    onUpdateResult(image.id, editText);
    setIsEditing(false);
  };

  const currentIndex = images.findIndex((img) => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/90 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold truncate max-w-md">{image.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {images.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Image Section */}
          <div className="flex-1 relative bg-black/50 flex items-center justify-center p-4">
            {/* Navigation Buttons */}
            {hasPrev && (
              <button
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <img
              src={image.preview}
              alt={image.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Text Section */}
          <div className="w-96 border-l border-border flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Generated Text
              </h4>
              <div className="flex items-center gap-1">
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    disabled={!image.result}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="text-green-500"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRerun(image.id)}
                  title="Rerun"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-full min-h-[200px] bg-secondary/50 border border-border rounded-lg p-3 text-sm console-text resize-none focus:border-primary focus:outline-none"
                  autoFocus
                />
              ) : image.result ? (
                <pre className="text-sm console-text whitespace-pre-wrap break-words">
                  {image.result}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 opacity-30 mb-2" />
                  <p className="text-sm">No text generated yet</p>
                  <p className="text-xs mt-1">Process this image to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with keyboard hint */}
        <div className="px-4 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>Use ← → arrow keys to navigate</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  image,
  isSelected,
  onToggle,
  onDelete,
  onRerun,
  onUpdateResult,
  onOpenModal,
  onMouseDown,
  onItemMouseEnter,
  onClick,
  disabled,
}: {
  image: ImageItem;
  isSelected: boolean;
  onToggle: (isCtrlPressed: boolean) => void;
  onDelete: () => void;
  onRerun: () => void;
  onUpdateResult: (result: string) => void;
  onOpenModal: () => void;
  onMouseDown?: (e: React.MouseEvent, id: string) => void;
  onItemMouseEnter?: (id: string) => void;
  onClick?: (e: React.MouseEvent, id: string) => void;
  disabled: boolean;
}) {
  const [showText, setShowText] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(image.result || '');
  const [isHovered, setIsHovered] = useState(false);

  const longPressBind = useLongPress({
    onLongPress: onDelete,
    onCancel: () => setDeleteProgress(0),
    duration: 1000,
    onProgress: setDeleteProgress,
  });

  const handleSaveEdit = () => {
    onUpdateResult(editText);
    setIsEditing(false);
  };

  const getStatusClass = () => {
    switch (image.status) {
      case 'done':
        return 'status-done';
      case 'processing':
        return 'status-processing';
      case 'error':
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = () => {
    switch (image.status) {
      case 'done':
        return 'Done';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <>
      <div
        id={`image-${image.id}`}
        onMouseDown={(e) => onMouseDown?.(e, image.id)}
        onMouseEnter={() => {
          setIsHovered(true);
          onItemMouseEnter?.(image.id);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => onClick?.(e, image.id)}
        className={cn(
          'image-card relative bg-card rounded-xl border border-border overflow-hidden group select-none cursor-pointer user-select-none',
          isSelected && 'card-selected',
          image.status === 'processing' && 'processing-card'
        )}
      >
        {/* Status Pill */}
        <div className={cn('status-pill absolute top-3 left-3 z-10', getStatusClass())}>
          {getStatusText()}
        </div>

        {/* Delete Button with Long Press */}
        <button
          {...longPressBind}
          className={cn(
            'absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm',
            'flex items-center justify-center text-white transition-all hover:bg-destructive',
            'active:scale-90'
          )}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          {deleteProgress > 0 && (
            <div
              className="long-press-indicator"
              style={{ '--progress': `${deleteProgress}%` } as React.CSSProperties}
            />
          )}
        </button>

        {/* Image */}
        <div className="aspect-square bg-black/50 overflow-hidden relative">
          <img
            src={image.preview}
            alt={image.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {image.status === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          
          {/* Maximize Button - appears on hover, hidden when Ctrl/Cmd is pressed */}
          {isHovered && image.status !== 'processing' && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              onClick={(e) => {
                e.stopPropagation();
                if (!(e.ctrlKey || e.metaKey)) {
                  onOpenModal();
                }
              }}
            >
              <button
                className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-colors shadow-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize2 className="h-6 w-6 text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-3 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={image.name}>
              {image.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {image.status === 'done' ? 'Tagged' : image.status === 'error' ? 'Failed' : 'Waiting...'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {image.result && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowText(true);
                  }}
                  title="View text"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    const blob = new Blob([image.result!], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = image.name.replace(/\.[^/.]+$/, '') + '.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  title="Download text"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onRerun();
              }}
              disabled={disabled || image.status === 'processing'}
              title="Rerun"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Text Viewer/Editor Modal */}
      {showText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/80"
          onClick={() => {
            setShowText(false);
            setIsEditing(false);
          }}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {image.name.replace(/\.[^/.]+$/, '')}.txt
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="text-green-500"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setShowText(false);
                    setIsEditing(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-full min-h-[300px] bg-secondary/50 border border-border rounded-lg p-3 text-sm console-text resize-none focus:border-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <pre className="text-sm console-text whitespace-pre-wrap break-words">
                  {image.result}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// List View Item Component
function ListViewItem({
  image,
  isSelected,
  onToggle,
  onDelete,
  onRerun,
  onOpenModal,
  onMouseDown,
  onMouseEnter,
  onClick,
  disabled,
}: {
  image: ImageItem;
  isSelected: boolean;
  onToggle: (isCtrlPressed: boolean) => void;
  onDelete: () => void;
  onRerun: () => void;
  onOpenModal: () => void;
  onMouseDown?: (e: React.MouseEvent, id: string) => void;
  onMouseEnter?: (id: string) => void;
  onClick?: (e: React.MouseEvent, id: string) => void;
  disabled: boolean;
}) {
  const getStatusClass = () => {
    switch (image.status) {
      case 'done':
        return 'status-done';
      case 'processing':
        return 'status-processing';
      case 'error':
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown?.(e, image.id)}
      onMouseEnter={() => onMouseEnter?.(image.id)}
      onClick={(e) => onClick?.(e, image.id)}
      className={cn(
        'flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer select-none user-select-none',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-black/50">
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-full object-cover"
        />
        {image.status === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusClass())}>
            {image.status === 'done' ? 'Done' : image.status === 'processing' ? 'Processing' : image.status === 'error' ? 'Error' : 'Pending'}
          </span>
          {image.result && (
            <span className="text-xs text-muted-foreground">
              {image.result.length} chars
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal();
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onRerun();
          }}
          disabled={disabled || image.status === 'processing'}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ImageGallery({
  images,
  selectedIds,
  onToggleSelection,
  onDelete,
  onRerun,
  onUpdateResult,
  isProcessing,
}: ImageGalleryProps) {
  const [modalImageId, setModalImageId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid-6');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isDragging, setIsDragging] = useState(false);
  const isCtrlPressed = useRef(false);
  const dragStartId = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const wasDraggingRef = useRef(false);
  const toggledInMouseDownRef = useRef(false);

  const handleOpenModal = useCallback((id: string) => {
    setModalImageId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalImageId(null);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!modalImageId) return;
    
    const currentIndex = sortedImages.findIndex((img) => img.id === modalImageId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : sortedImages.length - 1;
    } else {
      newIndex = currentIndex < sortedImages.length - 1 ? currentIndex + 1 : 0;
    }

    setModalImageId(sortedImages[newIndex].id);
  }, [modalImageId]);

  // Mouse selection handlers (no native drag-and-drop)
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    dragStartId.current = id;
    isDraggingRef.current = true;
    wasDraggingRef.current = false;
    toggledInMouseDownRef.current = false;
    setIsDragging(true);
    // Only toggle the first item if Ctrl is pressed (we're starting a multi-select drag)
    if (e.ctrlKey || e.metaKey) {
      toggledInMouseDownRef.current = true;
      onToggleSelection(id, true);
    }
  }, [onToggleSelection]);

  const handleMouseEnter = useCallback((id: string) => {
    if (!isDraggingRef.current || !isCtrlPressed.current) return;
    wasDraggingRef.current = true;
    // Toggle this item
    onToggleSelection(id, true);
  }, [onToggleSelection]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      toggledInMouseDownRef.current = false;
      return;
    }
    // If we already toggled this item in mousedown, don't toggle again
    if (toggledInMouseDownRef.current) {
      toggledInMouseDownRef.current = false;
      return;
    }
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onToggleSelection(id, isMultiSelect);
  }, [onToggleSelection]);

  // Track Ctrl key state globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        isCtrlPressed.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        isCtrlPressed.current = false;
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  // Pagination for large datasets
  const [page, setPage] = useState(1);
  const itemsPerPage = viewMode === 'list' ? 100 : 60;
  const totalPages = Math.ceil(images.length / itemsPerPage);
  
  // Sort images - use web worker for large datasets
  const sortedImages = useMemo(() => {
    if (images.length > 1000) {
      // For very large datasets, sort in chunks to avoid blocking
      return [...images].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    }
    return [...images].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [images, sortOrder]);

  // Paginated images for grid views
  const paginatedImages = useMemo(() => {
    if (viewMode === 'list') return sortedImages;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedImages.slice(start, end);
  }, [sortedImages, page, itemsPerPage, viewMode]);

  // Reset page when view mode changes
  useEffect(() => {
    setPage(1);
  }, [viewMode, sortOrder]);

  const modalImage = modalImageId ? sortedImages.find((img) => img.id === modalImageId) : null;

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-sm">No images uploaded yet</p>
        <p className="text-xs mt-1">Upload images to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Controls Header */}
      <div className="flex items-center justify-between mb-4">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid-3' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode('grid-3')}
            title="3 columns"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid-6' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode('grid-6')}
            title="6 columns"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
        </Button>
      </div>

      {/* Pagination Controls - show for large datasets */}
      {images.length > itemsPerPage && (
        <div className="flex items-center justify-between mb-4 py-2">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, images.length)} of {images.length} images
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid/List */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {sortedImages.map((image) => (
            <ListViewItem
              key={image.id}
              image={image}
              isSelected={selectedIds.has(image.id)}
              onToggle={(isCtrlPressed) => {
                onToggleSelection(image.id, isCtrlPressed);
              }}
              onDelete={() => onDelete(image.id)}
              onRerun={() => onRerun(image.id)}
              onOpenModal={() => handleOpenModal(image.id)}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onClick={handleClick}
              disabled={isProcessing}
            />
          ))}
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid-3' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          viewMode === 'grid-6' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
        )}>
          {paginatedImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isSelected={selectedIds.has(image.id)}
              onToggle={(isCtrlPressed) => onToggleSelection(image.id, isCtrlPressed)}
              onDelete={() => onDelete(image.id)}
              onRerun={() => onRerun(image.id)}
              onUpdateResult={(result) => onUpdateResult(image.id, result)}
              onOpenModal={() => handleOpenModal(image.id)}
              onMouseDown={handleMouseDown}
              onItemMouseEnter={handleMouseEnter}
              onClick={handleClick}
              disabled={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          image={modalImage}
          images={sortedImages}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
          onUpdateResult={onUpdateResult}
          onRerun={onRerun}
        />
      )}
    </>
  );
}
