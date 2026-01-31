import { useState, useCallback, useRef } from 'react';
import type { LogEntry } from '@/types';

export function useLogger(maxLogs: number = 100) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<LogEntry[]>([]);

  const addLog = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      const newLog: LogEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: new Date(),
        message,
        type,
      };

      logsRef.current = [...logsRef.current, newLog].slice(-maxLogs);
      setLogs(logsRef.current);

      // Also log to console
      const consoleMethod = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log;
      consoleMethod(`[${type.toUpperCase()}] ${message}`);
    },
    [maxLogs]
  );

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  const getLogsText = useCallback(() => {
    return logsRef.current
      .map(
        (log) =>
          `[${log.timestamp.toLocaleTimeString()}] [${log.type.toUpperCase()}] ${log.message}`
      )
      .join('\n');
  }, []);

  return { logs, addLog, clearLogs, getLogsText };
}
