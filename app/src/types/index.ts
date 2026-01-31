export interface ImageItem {
  id: string;
  name: string;
  mime: string;
  data: string;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: string;
  error?: string;
}

export interface BatchConfig {
  apiKey: string;
  model: string;
  systemInstructions: string;
  prompt: string;
  batchSize: number;
}

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  icon: 'crown' | 'zap' | 'piggy-bank';
  iconColor: string;
};

export type ProcessingState = 'idle' | 'running' | 'paused';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'warn' | 'success';
}

export interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
}
