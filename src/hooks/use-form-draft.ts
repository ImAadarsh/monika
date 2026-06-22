"use client";

import { useCallback, useEffect, useRef } from "react";

export function useFormDraft(formId: string, data: unknown, enabled = true) {
  const key = `formflow-draft-${formId}`;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
      } catch {
        /* quota */
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, data, enabled]);

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as { data: unknown; savedAt: number };
    } catch {
      return null;
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { loadDraft, clearDraft };
}

export function useEditorDraft(formId: string, state: unknown) {
  const key = `formflow-editor-${formId}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [key, state]);

  return {
    loadEditorDraft: () => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    clearEditorDraft: () => localStorage.removeItem(key),
  };
}
