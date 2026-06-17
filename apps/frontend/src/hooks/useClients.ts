'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '@/lib/api-error';
import type {
  Client,
  ClientsApiResponse,
  CreateClientInput,
  UpdateClientInput,
} from '@/types/client';

interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const json: ClientsApiResponse = await response.json();
      setClients(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { clients, loading, error, refetch };
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const response = await fetch('/api/clients', {
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

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
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

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
