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
  const [formData, setFormData] = useState<AuditFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Storage full or unavailable - silent fail
    }
  }, [formData]);

  function clearForm() {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(DEFAULT_FORM);
  }

  return { formData, setFormData, clearForm, hydrated: true };
}
