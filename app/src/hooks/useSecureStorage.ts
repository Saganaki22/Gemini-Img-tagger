import { useState, useEffect, useCallback } from 'react';

// Simple XOR encryption for API key (not military grade but better than plaintext)
const XOR_KEY = 'ImageTaggerPro2024SecureKey';

function encrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length)
    );
  }
  return btoa(result);
}

function decrypt(encoded: string): string {
  try {
    const text = atob(encoded);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

export function useSecureStorage(key: string) {
  const [value, setValue] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setValue(decrypt(stored));
      } catch {
        localStorage.removeItem(key);
      }
    }
    setIsLoaded(true);
  }, [key]);

  const saveValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (newValue) {
        localStorage.setItem(key, encrypt(newValue));
      } else {
        localStorage.removeItem(key);
      }
    },
    [key]
  );

  const clearValue = useCallback(() => {
    setValue('');
    localStorage.removeItem(key);
  }, [key]);

  return { value, setValue: saveValue, clearValue, isLoaded };
}
