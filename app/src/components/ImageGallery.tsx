import { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, X, FileText, Check, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ImageItem } from '@/types';
import { useLongPress } from '@/hooks/useLongPress';

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
  disabled,
}: {
  image: ImageItem;
  isSelected: boolean;
  onToggle: (isCtrlPressed: boolean) => void;
  onDelete: () => void;
  onRerun: () => void;
  onUpdateResult: (result: string) => void;
  onOpenModal: () => void;
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
        className={cn(
          'image-card relative bg-card rounded-xl border border-border overflow-hidden group',
          isSelected && 'card-selected',
          image.status === 'processing' && 'processing-card'
        )}
        onClick={(e) => onToggle(e.ctrlKey || e.metaKey)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            <button
              onMouseDown={(e) => {
                // Prevent opening modal if Ctrl or Cmd is held
                if (e.ctrlKey || e.metaKey) {
                  e.stopPropagation();
                  return;
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Only open modal if Ctrl/Cmd is NOT pressed
                if (!(e.ctrlKey || e.metaKey)) {
                  onOpenModal();
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-colors shadow-lg">
                <Maximize2 className="h-6 w-6 text-black" />
              </div>
            </button>
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

  const handleOpenModal = useCallback((id: string) => {
    setModalImageId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalImageId(null);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!modalImageId) return;
    
    const currentIndex = images.findIndex((img) => img.id === modalImageId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }

    setModalImageId(images[newIndex].id);
  }, [modalImageId, images]);

  const modalImage = modalImageId ? images.find((img) => img.id === modalImageId) : null;

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            isSelected={selectedIds.has(image.id)}
            onToggle={(isCtrlPressed) => onToggleSelection(image.id, isCtrlPressed)}
            onDelete={() => onDelete(image.id)}
            onRerun={() => onRerun(image.id)}
            onUpdateResult={(result) => onUpdateResult(image.id, result)}
            onOpenModal={() => handleOpenModal(image.id)}
            disabled={isProcessing}
          />
        ))}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          image={modalImage}
          images={images}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
          onUpdateResult={onUpdateResult}
          onRerun={onRerun}
        />
      )}
    </>
  );
}
