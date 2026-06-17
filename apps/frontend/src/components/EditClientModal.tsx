'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import type { Client } from '@/types/client';

interface EditClientFormProps {
  client: Client;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
  onClose: () => void;
}

export function EditClientForm({ client, onSubmit, onClose }: EditClientFormProps) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, email });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}
      <div>
        <label className="form-label">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />
      </div>
      <div>
        <label className="form-label">Email de destino</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

interface EditClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (id: string, data: { name: string; email: string }) => Promise<void>;
}

export function EditClientModal({ client, onClose, onSubmit }: EditClientModalProps) {
  return (
    <Modal title="Editar cliente" open={client !== null} onClose={onClose}>
      {client && (
        <EditClientForm
          client={client}
          onSubmit={(data) => onSubmit(client.id, data)}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
