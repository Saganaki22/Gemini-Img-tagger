import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface DropzoneProps {
  onImagesAdd: (images: { name: string; mime: string; data: string; preview: string; result?: string }[]) => void;
  disabled?: boolean;
}

export function Dropzone({ onImagesAdd, disabled }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<{ name: string; mime: string; data: string; preview: string } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({
          name: file.name,
          mime: file.type,
          data: base64Data,
          preview: result,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processZipFile = async (file: File): Promise<{ name: string; mime: string; data: string; preview: string; result?: string }[]> => {
    const images: { name: string; mime: string; data: string; preview: string; result?: string }[] = [];
    const textFiles: Map<string, string> = new Map();
    
    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles: JSZip.JSZipObject[] = [];

      // First pass: collect all text files
      zip.forEach((_, zipEntry) => {
        if (!zipEntry.dir && zipEntry.name.endsWith('.txt')) {
          // Store text file for later association
          const baseName = zipEntry.name.replace(/\.txt$/i, '');
          textFiles.set(baseName.toLowerCase(), '');
        }
      });

      // Extract text content
      for (const [fileName] of textFiles) {
        const txtEntry = zip.file(fileName + '.txt') || zip.file(fileName + '.TXT');
        if (txtEntry) {
          try {
            const content = await txtEntry.async('text');
            textFiles.set(fileName, content);
          } catch {
            // Skip failed text extractions
          }
        }
      }

      // Second pass: collect images
      zip.forEach((_, zipEntry) => {
        if (!zipEntry.dir && /\.(jpe?g|png|webp|gif|bmp)$/i.test(zipEntry.name)) {
          imageFiles.push(zipEntry);
        }
      });

      for (const imgEntry of imageFiles) {
        try {
          const blob = await imgEntry.async('blob');
          const proxyFile = new File([blob], imgEntry.name, { type: 'image/png' });
          const image = await processFile(proxyFile);
          if (image) {
            // Check for matching text file
            const baseName = imgEntry.name.replace(/\.[^/.]+$/, '').toLowerCase();
            const textContent = textFiles.get(baseName);
            if (textContent) {
              images.push({ ...image, result: textContent, status: 'done' });
            } else {
              images.push(image);
            }
          }
        } catch {
          // Skip failed extractions
        }
      }
    } catch {
      // Invalid ZIP
    }

    return images;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return;

      const allImages: { name: string; mime: string; data: string; preview: string }[] = [];

      for (const file of Array.from(files)) {
        if (file.name.endsWith('.zip')) {
          const zipImages = await processZipFile(file);
          allImages.push(...zipImages);
        } else if (file.type.startsWith('image/')) {
          const image = await processFile(file);
          if (image) allImages.push(image);
        }
      }

      if (allImages.length > 0) {
        onImagesAdd(allImages);
      }
    },
    [disabled, onImagesAdd]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Upload Images
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
          'bg-secondary/30 border-border hover:border-primary/50 hover:bg-primary/5',
          isDragging && 'dropzone-hover scale-[1.02]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.zip"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className={cn(
          'flex flex-col items-center gap-3 transition-transform duration-300',
          isDragging && 'scale-110'
        )}>
          <div className={cn(
            'w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300',
            isDragging && 'bg-primary/20 animate-pulse-glow'
          )}>
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP, and ZIP files
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Images</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileArchive className="h-3.5 w-3.5" />
              <span>ZIP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
