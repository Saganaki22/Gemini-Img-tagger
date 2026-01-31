import { useState, useEffect } from 'react';
import { X, ExternalLink, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 1000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 w-12 h-12 rounded-full bg-secondary/80 hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-500 animate-gentle-pulse z-50 hover:scale-110 hover:shadow-lg hover:shadow-primary/20',
          isVisible ? 'right-6' : 'right-6'
        )}
        title="Help & Instructions"
      >
        <span className="text-lg font-bold">?</span>
      </button>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-6 w-12 h-12 rounded-full bg-secondary/80 hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 hover:shadow-lg hover:shadow-primary/20',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ right: '6.5rem' }}
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 modal-backdrop bg-black/90 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl w-full max-w-3xl xl:max-w-4xl max-h-[90vh] flex flex-col animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-semibold">Help & Instructions</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Getting Started */}
              <section className="bg-secondary/30 rounded-lg p-4 sm:p-5 border border-border/50">
                <h3 className="font-bold text-primary text-lg sm:text-xl mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span> Getting Started
                </h3>
                <div className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>
                    1. <strong>Add your API Key</strong> - Get a free key from Google AI Studio
                  </p>
                  <p>
                    2. <strong>Upload images</strong> - Drag & drop or click to browse
                  </p>
                  <p>
                    3. <strong>Click Start Batch</strong> - Images will be automatically tagged
                  </p>
                  <p>
                    4. <strong>Export results</strong> - Download as ZIP with .txt files
                  </p>
                </div>
              </section>

              {/* Upload */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">📤</span> Uploading Images
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Drag images directly onto the upload area or click to browse your files. You can upload individual images (JPG, PNG, WebP) or ZIP archives. If your ZIP includes .txt files with matching names, they'll automatically load as pre-existing captions.
                </p>
              </section>

              {/* Selection */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">🖱️</span> Selecting Images
                </h3>
                <div className="grid gap-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p><strong>• Click</strong> any image to select it (other images are deselected)</p>
                  <p><strong>• Ctrl + Click</strong> to add/remove images from your selection</p>
                  <p><strong>• Ctrl + Drag</strong> over multiple images to select them all at once</p>
                  <p><strong>• Select All</strong> button selects every image</p>
                </div>
              </section>

              {/* Processing */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Processing Images
                </h3>
                <div className="grid gap-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p><strong>• Start Batch</strong> - Process all pending images (green button)</p>
                  <p><strong>• Start Selected</strong> - Process only the images you've selected</p>
                  <p><strong>• Pause</strong> - Temporarily stop (finishes current batch first)</p>
                  <p><strong>• Stop</strong> - Abort immediately</p>
                  <p><strong>• ↻ Retry</strong> - Click the refresh icon on any image to retry just that one</p>
                  <p><strong>• Batch Size</strong> - Adjust how many images are sent per API request (default: 5)</p>
                </div>
              </section>

              {/* View Modes */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">🖼️</span> View Modes & Sorting
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Switch between <strong>Grid 3</strong>, <strong>Grid 6</strong>, or <strong>List</strong> view using the buttons at the top of the gallery. Use the <strong>A-Z / Z-A</strong> button to sort images alphabetically. In List view, you'll see thumbnails with full filenames.
                </p>
              </section>

              {/* Editing */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">✏️</span> Editing Descriptions
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Click on any image to open the fullscreen viewer. You can view the generated description and click "Edit" to modify it. Use the arrow keys (← →) to navigate between images while in the viewer. Press ESC to close.
                </p>
              </section>

              {/* System Instructions */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">📝</span> System Instructions & Prompts
                </h3>
                <div className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>
                    <strong>System Instructions</strong> guide the AI's behavior for all descriptions. Click the ⛶ button to expand the full editor.
                  </p>
                  <p>
                    <strong>Prompt</strong> is text added to every image request. Use this for trigger words like: "include this at the beginning of the description: example_trigger, "
                  </p>
                </div>
              </section>

              {/* Export */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">💾</span> Exporting Results
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Click <strong>Export ZIP</strong> to download all completed images with their .txt caption files. If you've selected specific images, the button changes to "Export Selected (X)" and will only export those images. You can also click the download icon on any individual image to save just that caption.
                </p>
              </section>

              {/* Sound */}
              <section>
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">🔔</span> Sound Notifications
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  A beep sound plays when each image finishes processing and when the entire batch completes. Use the <strong>speaker icon</strong> in the top header to mute or unmute notifications.
                </p>
              </section>

              {/* Tips */}
              <section className="bg-primary/10 rounded-lg p-4 sm:p-5 border border-primary/20">
                <h3 className="font-bold text-primary text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> Pro Tips
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <li>Start with batch size 5, then increase based on your API limits</li>
                  <li>ZIP uploads with matching .txt files auto-load existing captions</li>
                </ul>
              </section>

              {/* Footer */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm sm:text-base text-center text-muted-foreground mb-4">
                  If you find this tool helpful, consider starring the repository!
                </p>
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  <a
                    href="https://x.com/drbaph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Twitter / X
                  </a>
                  <a
                    href="https://www.instagram.com/drbaph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Instagram
                  </a>
                  <a
                    href="https://github.com/Saganaki22/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="https://huggingface.co/drbaph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    HuggingFace
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-border bg-secondary/30">
              <Button onClick={() => setIsOpen(false)} className="w-full text-base py-2">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
