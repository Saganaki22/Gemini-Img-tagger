// Web Worker for sorting large image arrays
// This prevents UI blocking on large datasets

interface ImageItem {
  id: string;
  name: string;
  mime: string;
  data: string;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: string;
  error?: string;
}

self.onmessage = (e: MessageEvent) => {
  const { images, sortOrder, chunkSize = 1000 } = e.data;
  
  try {
    // Sort the images
    const sorted = [...images].sort((a: ImageItem, b: ImageItem) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    
    // Send back in chunks to prevent message size limits
    if (sorted.length > chunkSize) {
      const chunks = Math.ceil(sorted.length / chunkSize);
      for (let i = 0; i < chunks; i++) {
        const chunk = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
        self.postMessage({
          type: 'chunk',
          chunk,
          chunkIndex: i,
          totalChunks: chunks,
          isComplete: i === chunks - 1
        });
      }
    } else {
      self.postMessage({
        type: 'complete',
        sorted,
        isComplete: true
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export {};
