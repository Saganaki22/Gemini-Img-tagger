import { useState, useCallback, useRef } from 'react';
import type { ImageItem, BatchConfig } from '@/types';
import { useLogger } from './useLogger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

interface ProcessResult {
  success: boolean;
  text?: string;
  error?: string;
}

export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { logs, addLog, getLogsText } = useLogger();

  const processImage = useCallback(
    async (item: ImageItem, config: BatchConfig, attempt = 1): Promise<ProcessResult> => {
      const modelId = config.model;
      const isGemini3 = modelId.includes('gemini-3');
      
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: config.systemInstructions
                  ? `${config.systemInstructions}\n\n${config.prompt}`
                  : config.prompt,
              },
              {
                inline_data: {
                  mime_type: item.mime,
                  data: item.data,
                },
              },
            ],
          },
        ],
        generationConfig: isGemini3
          ? {
              thinkingConfig: {
                thinkingLevel: 'HIGH',
              },
            }
          : {
              thinkingConfig: {
                thinkingBudget: -1,
              },
            },
        tools: [
          {
            googleSearch: {},
          },
        ],
      };

      addLog(`Sending request to ${modelId} for ${item.name}...`, 'info');

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${config.apiKey}`,
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

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        let fullText = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith('[') || line.startsWith(',')) continue;
            try {
              const json = JSON.parse(line);
              if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullText += json.candidates[0].content.parts[0].text;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }

        if (!fullText.trim()) {
          throw new Error('Empty response from API');
        }

        addLog(`Successfully processed ${item.name}`, 'success');
        return { success: true, text: fullText };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Aborted' };
        }

        addLog(`Error processing ${item.name}: ${error.message}`, 'error');

        if (attempt < MAX_RETRIES) {
          addLog(`Retrying ${item.name} (attempt ${attempt + 1}/${MAX_RETRIES})...`, 'warn');
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return processImage(item, config, attempt + 1);
        }

        return { success: false, error: error.message };
      }
    },
    [addLog]
  );

  const processBatch = useCallback(
    async (
      items: ImageItem[],
      config: BatchConfig,
      onItemComplete: (item: ImageItem, result: string) => void,
      onItemError: (item: ImageItem, error: string) => void
    ) => {
      setIsProcessing(true);
      setProgress(0);
      abortControllerRef.current = new AbortController();

      const batchSize = config.batchSize;
      const totalItems = items.length;
      let completedCount = 0;

      addLog(`Starting batch processing: ${totalItems} images (batch size: ${batchSize})`, 'info');

      try {
        for (let i = 0; i < totalItems; i += batchSize) {
          if (abortControllerRef.current.signal.aborted) {
            addLog('Batch processing stopped by user', 'warn');
            break;
          }

          const batch = items.slice(i, i + batchSize);
          addLog(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalItems / batchSize)}`, 'info');

          await Promise.all(
            batch.map(async (item) => {
              const result = await processImage(item, config);
              completedCount++;
              setProgress((completedCount / totalItems) * 100);

              if (result.success && result.text) {
                onItemComplete(item, result.text);
              } else {
                onItemError(item, result.error || 'Unknown error');
              }
            })
          );

          // Small delay between batches to avoid rate limiting
          if (i + batchSize < totalItems) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        addLog('Batch processing complete', 'success');
      } catch (error: any) {
        addLog(`Batch processing error: ${error.message}`, 'error');
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    },
    [addLog, processImage]
  );

  const stopProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog('Stopping batch processing...', 'warn');
    }
  }, [addLog]);

  return {
    isProcessing,
    progress,
    logs,
    addLog,
    getLogsText,
    processBatch,
    stopProcessing,
  };
}
