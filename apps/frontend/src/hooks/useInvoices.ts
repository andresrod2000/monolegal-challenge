'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '@/lib/api-error';
import type {
  CreateInvoiceInput,
  Invoice,
  InvoicesApiResponse,
  UpdateInvoiceInput,
} from '@/types/invoice';

interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const json: InvoicesApiResponse = await response.json();
      setInvoices(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { invoices, loading, error, refetch };
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = await response.json();
  return json.data;
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = await response.json();
  return json.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
