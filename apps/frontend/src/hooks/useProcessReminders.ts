'use client';

import { useCallback, useState } from 'react';
import { parseApiError } from '@/lib/api-error';

export interface ProcessRemindersResult {
  processed: number;
  failed: number;
}

interface UseProcessRemindersResult {
  loading: boolean;
  processingInvoiceId: string | null;
  error: string | null;
  result: ProcessRemindersResult | null;
  execute: () => Promise<ProcessRemindersResult | null>;
  executeForInvoice: (invoiceId: string) => Promise<ProcessRemindersResult | null>;
  reset: () => void;
}

export function useProcessReminders(): UseProcessRemindersResult {
  const [loading, setLoading] = useState(false);
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessRemindersResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const execute = useCallback(async (): Promise<ProcessRemindersResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/reminders/process', { method: 'POST' });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const json = await response.json();
      const data = json.data as ProcessRemindersResult;
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar recordatorios';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeForInvoice = useCallback(
    async (invoiceId: string): Promise<ProcessRemindersResult | null> => {
      setProcessingInvoiceId(invoiceId);
      setError(null);
      setResult(null);
      try {
        const response = await fetch(`/api/reminders/process/${invoiceId}`, { method: 'POST' });
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        const json = await response.json();
        const data = json.data as ProcessRemindersResult;
        setResult(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al procesar recordatorio de factura';
        setError(message);
        return null;
      } finally {
        setProcessingInvoiceId(null);
      }
    },
    [],
  );

  return { loading, processingInvoiceId, error, result, execute, executeForInvoice, reset };
}
