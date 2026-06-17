'use client';

import { useState } from 'react';
import { Modal } from './Modal';

interface CreateClientFormProps {
  onSubmit: (data: { id: string; name: string; email: string }) => Promise<void>;
  onClose: () => void;
}

export function CreateClientForm({ onSubmit, onClose }: CreateClientFormProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ id, name, email });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-slate-400">ID (ej. client-nuevo)</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Email de destino</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Creando…' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id: string; name: string; email: string }) => Promise<void>;
}

export function CreateClientModal({ open, onClose, onSubmit }: CreateClientModalProps) {
  return (
    <Modal title="Nuevo cliente" open={open} onClose={onClose}>
      <CreateClientForm onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}
