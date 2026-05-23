// src/lib/usePersistedForm.ts
'use client';
import { useState, useEffect } from 'react';
import type { AuditFormData } from '../types';

const STORAGE_KEY = 'spendscope_form_v1';

const DEFAULT_FORM: AuditFormData = {
  tools: [],
  teamSize: 1,
  useCase: 'mixed',
};

export function usePersistedForm() {
  const [formData, setFormData] = useState<AuditFormData>(DEFAULT_FORM);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch {
      // Corrupt data — start fresh
    }
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }, [formData, hydrated]);

  function clearForm() {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(DEFAULT_FORM);
  }

  return { formData, setFormData, clearForm, hydrated };
}
