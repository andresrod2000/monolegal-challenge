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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}
      <div>
        <label className="form-label">ID (ej. client-nuevo)</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className="input-field"
        />
      </div>
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
