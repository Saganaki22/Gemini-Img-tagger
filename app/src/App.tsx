import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Settings2, Github, Maximize2, X, Volume2, VolumeX, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { ModelSelector } from '@/components/ModelSelector';
import { Dropzone } from '@/components/Dropzone';
import { ImageGallery } from '@/components/ImageGallery';
import { Console } from '@/components/Console';
import { BatchControls } from '@/components/BatchControls';
import { ToastContainer, useToast } from '@/components/Toast';
import { useSecureStorage } from '@/hooks/useSecureStorage';
import { useLogger } from '@/hooks/useLogger';
import type { ImageItem, ProcessingState } from '@/types';
import JSZip from 'jszip';

function App() {
  // API Key
  const { value: apiKey, setValue, isLoaded: apiKeyLoaded } = useSecureStorage('gemini_api_key');

  // Model & Config
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [systemInstructions, setSystemInstructions] = useState(`You are a specialized visual analysis engine designed for high-fidelity data annotation. Your goal is to generate a dense, structured textual description of input images, optimized for machine learning training and visual indexing.

**Output Protocol:**
- **Format:** Produce exactly one continuous paragraph (150-400 words).
- **Tone:** Use strict, evidence-based description. Focus only on visible features.
- **Certainty:** If precise identification is impossible, use qualifiers like "appears to be," "resembling," or "likely" rather than guessing.
- **Prohibitions:** Do not use meta-phrases ("This image shows," "in the frame"). Do not use emotional or aesthetic adjectives ("beautiful," "disturbing," "inspiring").

**Prioritization Hierarchy:**
Structure your paragraph to flow strictly in this order:
1.  **Primary Subject (Highest Priority):** The central focus, action, and physical details.
2.  **Spatial Context:** The environment, background, and relationships between objects.
3.  **Technical & Aesthetic Qualities:** Lighting, medium, artistic style, and camera attributes.

**Analysis Dimensions:**

1.  **Primary Subjects & Entities**
    - Identify subjects with high visual specificity (e.g., "tabby cat" instead of "animal," "distressed denim" instead of "clothes").
    - Describe distinct physical actions (e.g., "gripping," "leaning," "accelerating").
    - Detail surface textures (e.g., rust, silk, matte plastic, organic fur) and material conditions (e.g., wet, worn, pristine).

2.  **Physical Environment & Context**
    - Describe the setting (e.g., industrial interior, dense forest, minimal studio void).
    - Note time-of-day cues based on visible evidence (e.g., long shadows, artificial streetlights).
    - Describe atmospheric effects (e.g., haze, rain streaks, dust particles) and background elements.

3.  **Technical, Optical & Artistic Qualities**
    - **Medium:** Identify the visual style (e.g., oil painting, DSLR photography, 3D render, pixel art, pencil sketch).
    - **Lighting:** Describe the type of light (e.g., soft window light, harsh neon, direct sunlight) and shadow qualities.
    - **Color:** specific color palette descriptions (e.g., "desaturated cool blues," "vibrant high-contrast reds").
    - **Camera/Composition:** Describe the perspective (e.g., low angle, overhead), depth of field (e.g., blurred background/bokeh), and framing.

**Special Handling:**
- **Text:** Transcribe legible text exactly. If text is illegible, describe it as "indistinct text blocks."
- **Obscured Objects:** If an object is partially hidden or blurry, describe the visible portions only (e.g., "a silhouette resembling a vehicle").

Analyze the image now.
Example Output (Demonstrating the Hierarchy)
Input: A photo of an astronaut sitting in a retro diner.
Model Output:
A figure wearing a bulky, white extra-vehicular activity spacesuit sits alone in a red vinyl booth. The suit features detailed mechanical couplings, a reflective gold-tinted visor obscuring the face, and fabric wrinkling at the joints suggesting heavy, stiff material. The figure's gloved hands rest motionless on a white laminate table surface. To the right of the astronaut, a half-empty glass bottle of cola sits on a paper napkin. The setting appears to be a mid-20th-century American diner, characterized by a checkered black-and-white tile floor, chrome trim along the counter, and large glass windows revealing a dark, starless exterior. The interior lighting is warm and artificial, likely overhead fluorescent, casting soft, diffuse reflections on the astronaut's helmet and the chrome surfaces. The image has the visual characteristics of a cinematic film still, featuring a shallow depth of field that keeps the astronaut in sharp focus while the background diner elements are slightly softened. The color palette contrasts the clinical, sterile white of the spacesuit against the warm, saturated reds and teals of the diner interior. There is a slight layer of film grain visible across the image, giving it a tactile, analog texture.`);
  const [prompt, setPrompt] = useState('Include this at the beggining of the description: example_trigger_word, ');
  const [batchSize, setBatchSize] = useState(5);

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Processing
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');

  // Console
  const [consoleExpanded, setConsoleExpanded] = useState(false);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const imageGalleryRef = useRef<HTMLDivElement>(null);

  // System Instructions Modal
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  // Sound & Time Tracking
  const [isMuted, setIsMuted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toast
  const { toasts, addToast, removeToast } = useToast();

  // Logger
  const { logs, addLog } = useLogger();

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);
  const currentBatchIndexRef = useRef(0);
  const itemsToProcessRef = useRef<ImageItem[]>([]);
  const pendingRerunsRef = useRef<Set<string>>(new Set());

  // Beep sound function
  const playBeep = useCallback(() => {
    if (isMuted) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not supported, silently fail
    }
  }, [isMuted]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect with performance tracking
  const completedTimestampsRef = useRef<{ count: number; lastUpdate: number }>({ count: 0, lastUpdate: 0 });
  
  useEffect(() => {
    if (processingState === 'running' && startTime) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate estimated time remaining based on actual processing rate
        const completedCount = images.filter(img => img.status === 'done').length;
        const processingCount = images.filter(img => img.status === 'processing').length;
        const totalInQueue = itemsToProcessRef.current.length;
        
        // Update tracking when images complete
        if (completedCount !== completedTimestampsRef.current.count) {
          completedTimestampsRef.current = { 
            count: completedCount, 
            lastUpdate: now 
          };
        }
        
        if (completedCount > 0 && totalInQueue > 0) {
          // Calculate average time per image
          const avgTimePerImage = elapsed / completedCount;
          const remainingImages = totalInQueue - completedCount;
          
          // Estimate: remaining images * avg time per image
          // Add a small buffer for processing images
          const processingBuffer = processingCount > 0 ? avgTimePerImage * 0.5 : 0;
          const estimatedRemaining = Math.floor((avgTimePerImage * remainingImages) + processingBuffer);
          
          setEstimatedTimeRemaining(Math.max(0, estimatedRemaining));
        } else if (processingCount > 0) {
          // If no completed yet but processing, show rough estimate
          setEstimatedTimeRemaining(null);
        }
      }, 500); // Update every 500ms for smoother UI
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      completedTimestampsRef.current = { count: 0, lastUpdate: 0 };
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [processingState, startTime, images]);

  // Search function
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase().trim();
    const foundImage = images.find(img => 
      img.name.toLowerCase().includes(query)
    );
    
    if (foundImage) {
      // Select the image
      setSelectedIds(new Set([foundImage.id]));
      
      // Scroll to the image
      const imageElement = document.getElementById(`image-${foundImage.id}`);
      if (imageElement) {
        imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        imageElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          imageElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
      
      addToast(`Found: ${foundImage.name}`, 'success');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      addToast('No image found matching that name', 'error');
    }
  }, [searchQuery, images, addToast]);

  // Add images
  const handleImagesAdd = useCallback(
    (newImages: { name: string; mime: string; data: string; preview: string }[]) => {
      const items: ImageItem[] = newImages.map((img) => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        name: img.name,
        mime: img.mime,
        data: img.data,
        preview: img.preview,
        status: 'pending',
      }));

      setImages((prev) => [...prev, ...items]);
      addToast(`Added ${items.length} image${items.length > 1 ? 's' : ''}`, 'success');
      addLog(`Added ${items.length} image(s) to queue`, 'success');
    },
    [addToast, addLog]
  );

  // Toggle selection
  const handleToggleSelection = useCallback((id: string, isCtrlPressed: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (isCtrlPressed) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id) && newSet.size === 1) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      return newSet;
    });
  }, []);

  // Delete image
  const handleDelete = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      addLog('Image deleted', 'info');
    },
    [addLog]
  );

  // Delete all
  const handleDeleteAll = useCallback(() => {
    if (selectedIds.size > 0) {
      setImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
      addToast(`Deleted ${selectedIds.size} image${selectedIds.size > 1 ? 's' : ''}`, 'success');
      setSelectedIds(new Set());
    } else {
      setImages([]);
      setSelectedIds(new Set());
      addToast('All images deleted', 'success');
    }
    addLog('Images deleted', 'info');
  }, [selectedIds, addToast, addLog]);

  // Process single image immediately
  const processSingleImage = useCallback(async (image: ImageItem) => {
    if (!apiKey) {
      addToast('Please enter your API key', 'error');
      return;
    }

    setProcessingState('running');
    addLog(`Processing single image: ${image.name}`, 'info');

    try {
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: image.mime,
                  data: image.data,
                },
              },
              {
                text: systemInstructions
                  ? `${systemInstructions}\n\n${prompt}`
                  : prompt,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!fullText.trim()) {
        throw new Error('Empty response from API');
      }

      // Update image with result
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'done', result: fullText }
            : img
        )
      );

      addLog(`Processed: ${image.name}`, 'success');
      playBeep();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: 'error', error: errorMessage } : img
        )
      );

      addLog(`Failed: ${image.name} - ${errorMessage}`, 'error');
    } finally {
      setProcessingState('idle');
    }
  }, [apiKey, model, systemInstructions, prompt, addLog, addToast, playBeep]);

  // Rerun image
  const handleRerun = useCallback(
    (id: string) => {
      const image = images.find(img => img.id === id);
      if (!image) return;

      // If image is currently processing, mark it for rerun after current batch
      if (image.status === 'processing') {
        pendingRerunsRef.current.add(id);
        addLog(`Image ${image.name} marked for reprocess after current batch`, 'info');
        return;
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'pending', result: undefined, error: undefined } : img
        )
      );
      addLog(`Queued ${id} for reprocessing`, 'info');

      // If processing is idle, process this single image immediately
      if (processingState === 'idle') {
        setTimeout(() => {
          processSingleImage({ ...image, status: 'pending' });
        }, 100);
      }
    },
    [images, processingState, processSingleImage, addLog]
  );

  // Update result
  const handleUpdateResult = useCallback((id: string, result: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, result } : img))
    );
  }, []);

  // Process batch
  const handleStart = useCallback(async () => {
    if (!apiKey) {
      addToast('Please enter your API key', 'error');
      return;
    }

    // Determine which images to process
    let itemsToProcess: ImageItem[];
    const hasActiveBatch = itemsToProcessRef.current.length > 0 && processingState === 'idle';
    
    if (hasActiveBatch) {
      // Resume from pause - get fresh status from current images state
      itemsToProcess = images.filter(img => 
        itemsToProcessRef.current.some(refImg => refImg.id === img.id) && 
        img.status !== 'done'
      );
    } else {
      // Start fresh
      itemsToProcess = selectedIds.size > 0
        ? images.filter((img) => selectedIds.has(img.id) && img.status !== 'done' && img.status !== 'processing')
        : images.filter((img) => img.status !== 'done' && img.status !== 'processing');
      itemsToProcessRef.current = itemsToProcess;
      currentBatchIndexRef.current = 0;
    }

    if (itemsToProcess.length === 0 || currentBatchIndexRef.current * batchSize >= itemsToProcess.length) {
      addToast('No images to process', 'warning');
      itemsToProcessRef.current = [];
      currentBatchIndexRef.current = 0;
      return;
    }

    setProcessingState('running');
    abortControllerRef.current = new AbortController();
    isPausedRef.current = false;
    isStoppedRef.current = false;
    completedTimestampsRef.current = { count: 0, lastUpdate: 0 };
    setStartTime(new Date());

    addLog(
      `Starting batch: ${itemsToProcess.length} images with ${model}`,
      'info'
    );

    const total = itemsToProcess.length;

    for (let i = currentBatchIndexRef.current * batchSize; i < total; i += batchSize) {
      currentBatchIndexRef.current = Math.floor(i / batchSize);
      
      // Check if stopped
      if (abortControllerRef.current?.signal.aborted) {
        addLog('Batch processing stopped', 'warn');
        break;
      }

      const batch = itemsToProcess.slice(i, i + batchSize);
      const totalBatches = Math.ceil(total / batchSize);
      const currentBatchNum = Math.floor(i / batchSize) + 1;
      addLog(`Processing batch ${currentBatchNum}/${totalBatches}`, 'info');

      // Update status to processing
      setImages((prev) =>
        prev.map((img) =>
          batch.some((b) => b.id === img.id) ? { ...img, status: 'processing' } : img
        )
      );

      // Process each image in the batch
      await Promise.all(
        batch.map(async (item) => {
          try {
            const payload = {
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inline_data: {
                        mime_type: item.mime,
                        data: item.data,
                      },
                    },
                    {
                      text: systemInstructions
                        ? `${systemInstructions}\n\n${prompt}`
                        : prompt,
                    },
                  ],
                },
              ],
            };

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current?.signal,
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
              throw new Error(data.error.message || 'API error');
            }

            const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (!fullText.trim()) {
              throw new Error('Empty response from API');
            }

            // Update image with result
            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id
                  ? { ...img, status: 'done', result: fullText }
                  : img
              )
            );

            addLog(`Processed: ${item.name}`, 'success');
          } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
              return;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id ? { ...img, status: 'error', error: errorMessage } : img
              )
            );

            addLog(`Failed: ${item.name} - ${errorMessage}`, 'error');
          }
        })
      );

      // Check if paused after completing the batch
      if (isPausedRef.current) {
        addLog('Batch paused. Click Start to resume.', 'warn');
        setProcessingState('idle');
        return;
      }

      // Check if stopped (current batch will finish, but don't continue to next)
      if (isStoppedRef.current) {
        addLog('Batch processing stopped', 'warn');
        break;
      }

      // Delay between batches (if not the last batch)
      if (i + batchSize < total) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Only play sound and show completion if not stopped/paused (i.e., completed successfully)
    if (!isStoppedRef.current && !isPausedRef.current) {
      playBeep();
      const doneCount = images.filter((img) => img.status === 'done').length;
      addToast(`Batch complete! ${doneCount} images processed.`, 'success');
    }

    // Process any pending reruns
    if (pendingRerunsRef.current.size > 0 && !isStoppedRef.current) {
      const rerunIds = Array.from(pendingRerunsRef.current);
      pendingRerunsRef.current.clear();
      
      addLog(`Processing ${rerunIds.length} rerun request(s)`, 'info');
      
      // Reset rerun images to pending
      setImages((prev) =>
        prev.map((img) =>
          rerunIds.includes(img.id) ? { ...img, status: 'pending', result: undefined, error: undefined } : img
        )
      );
      
      // Process each rerun
      for (const id of rerunIds) {
        const image = images.find(img => img.id === id);
        if (image) {
          await processSingleImage({ ...image, status: 'pending' });
        }
      }
    }

    // Reset refs when complete
    itemsToProcessRef.current = [];
    currentBatchIndexRef.current = 0;
    isStoppedRef.current = false;
    isPausedRef.current = false;
    completedTimestampsRef.current = { count: 0, lastUpdate: 0 };
    setProcessingState('idle');
    setStartTime(null);
    setElapsedTime(0);
    setEstimatedTimeRemaining(null);
    abortControllerRef.current = null;
  }, [apiKey, images, selectedIds, model, systemInstructions, prompt, batchSize, processingState, addToast, addLog, playBeep, processSingleImage]);

  // Pause
  const handlePause = useCallback(() => {
    isPausedRef.current = true;
    setProcessingState('idle');
    addLog('Batch paused', 'warn');
  }, [addLog]);

  // Stop
  const handleStop = useCallback(() => {
    isStoppedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessingState('idle');

    // Reset processing images to pending
    setImages((prev) =>
      prev.map((img) =>
        img.status === 'processing' ? { ...img, status: 'pending' } : img
      )
    );

    addLog('Batch stopped', 'warn');
    addToast('Batch processing stopped', 'warning');
  }, [addLog, addToast]);

  // Export ZIP
  const handleExportZip = useCallback(async () => {
    // If images are selected, export only selected ones with results
    // Otherwise export all completed images
    const imagesToExport = selectedIds.size > 0
      ? images.filter((img) => selectedIds.has(img.id) && img.result)
      : images.filter((img) => img.result);
    
    if (imagesToExport.length === 0) {
      addToast(selectedIds.size > 0 ? 'No selected images with results to export' : 'No completed images to export', 'error');
      return;
    }

    const exportType = selectedIds.size > 0 ? 'selected' : 'completed';
    addLog(`Creating ZIP with ${imagesToExport.length} ${exportType} files...`, 'info');

    try {
      const zip = new JSZip();

      for (const img of imagesToExport) {
        // Add the image file
        const imageData = img.data;
        const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
        zip.file(img.name, binaryData, { binary: true });
        
        // Add the text file with same base name
        const textFileName = img.name.replace(/\.[^/.]+$/, '') + '.txt';
        zip.file(textFileName, img.result!);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-tags-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      addLog('ZIP exported successfully', 'success');
      addToast(`ZIP file downloaded! (${imagesToExport.length} ${exportType} images)`, 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`ZIP export failed: ${errorMessage}`, 'error');
      addToast('Failed to export ZIP', 'error');
    }
  }, [images, selectedIds, addToast, addLog]);

  const completedCount = images.filter((img) => img.status === 'done').length;

  if (!apiKeyLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Image Tagger Pro</h1>
              <p className="text-xs text-muted-foreground">AI-powered image tagging with Gemini</p>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 flex justify-center px-4">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    } else if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  placeholder="Search image name..."
                  className="flex-1 h-9 px-3 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="h-9"
                >
                  Find
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="h-9 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                <span>{images.length} images</span>
                <span>{completedCount} tagged</span>
              </div>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              title="Search images"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              title={isMuted ? 'Unmute notification sounds' : 'Mute notification sounds'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <a
              href="https://github.com/Saganaki22/Gemini-Img-tagger"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* API Key */}
            <div className="bg-card border border-border rounded-xl p-4">
              <ApiKeyInput value={apiKey} onChange={setValue} />
            </div>

            {/* Model Selection */}
            <div className="bg-card border border-border rounded-xl p-4">
              <ModelSelector value={model} onChange={setModel} />
            </div>

            {/* Instructions */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 cursor-help">
                          <Settings2 className="h-3.5 w-3.5" />
                          System Instructions
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>High-level instructions that guide the AI's behavior for all image descriptions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={() => setIsSystemModalOpen(true)}
                    title="Expand to edit"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  placeholder="Optional: Add system-wide instructions..."
                  className="bg-secondary/50 border-border resize-none min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/50">
                        Prompt
                      </label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>For trigger word add &quot;include this at the beggining of the description: example,&quot;</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Include this at the beggining of the description: "
                  className="bg-secondary/50 border-border resize-none min-h-[80px]"
                />
              </div>
            </div>

            {/* Dropzone */}
            <div className="bg-card border border-border rounded-xl p-4">
              <Dropzone onImagesAdd={handleImagesAdd} disabled={processingState === 'running'} />
            </div>

            {/* Batch Controls */}
            <div className="bg-card border border-border rounded-xl p-4">
              <BatchControls
                state={processingState}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                onDeleteAll={handleDeleteAll}
                onExportZip={handleExportZip}
                selectedCount={selectedIds.size}
                totalCount={images.length}
                completedCount={completedCount}
                canExport={completedCount > 0}
                batchSize={batchSize}
                onBatchSizeChange={setBatchSize}
                elapsedTime={elapsedTime}
                estimatedTimeRemaining={estimatedTimeRemaining}
              />
            </div>

            {/* Console */}
            <Console
              logs={logs}
              isExpanded={consoleExpanded}
              onToggleExpand={() => setConsoleExpanded(!consoleExpanded)}
            />
          </aside>

          {/* Gallery */}
          <section className="bg-card border border-border rounded-xl p-4 min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Image Gallery</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={cn(selectedIds.size > 0 && 'text-primary font-medium')}>
                  {selectedIds.size} selected
                </span>
                {selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <ImageGallery
              images={images}
              selectedIds={selectedIds}
              onToggleSelection={handleToggleSelection}
              onDelete={handleDelete}
              onRerun={handleRerun}
              onUpdateResult={handleUpdateResult}
              isProcessing={processingState === 'running'}
            />
          </section>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* System Instructions Modal */}
      {isSystemModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/80"
          onClick={() => setIsSystemModalOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                System Instructions
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Autosaves on close</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsSystemModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                placeholder="Optional: Add system-wide instructions..."
                className="w-full h-full min-h-[400px] bg-secondary/50 border border-border rounded-lg p-4 text-sm resize-none focus:border-primary focus:outline-none console-text"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-secondary/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                These instructions guide the AI's behavior for all image descriptions
              </span>
              <Button
                onClick={() => setIsSystemModalOpen(false)}
                className="gap-2"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
