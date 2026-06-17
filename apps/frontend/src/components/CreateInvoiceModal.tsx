'use client';

import { useState } from 'react';
import { ALL_INVOICE_STATUSES, InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { Client } from '@/types/client';
import { Modal } from './Modal';

interface CreateInvoiceFormProps {
  clients: Client[];
  onSubmit: (data: {
    clientId: string;
    concept: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
  }) => Promise<void>;
  onClose: () => void;
}

export function CreateInvoiceForm({ clients, onSubmit, onClose }: CreateInvoiceFormProps) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.AL_DIA);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        clientId,
        concept,
        amount: Number(amount),
        dueDate: new Date(dueDate).toISOString(),
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  }

  if (clients.length === 0) {
    return (
      <p className="text-slate-400">Primero debe crear al menos un cliente.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-slate-400">Cliente</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Concepto</label>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          required
          placeholder="Ej. Suscripción SaaS — Julio 2026"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Monto (COP)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={1}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Fecha de vencimiento</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Estado inicial</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        >
          {ALL_INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getInvoiceStatusLabel(s)}
            </option>
          ))}
        </select>
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
          {submitting ? 'Creando…' : 'Crear factura'}
        </button>
      </div>
    </form>
  );
}

interface CreateInvoiceModalProps {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onSubmit: CreateInvoiceFormProps['onSubmit'];
}

export function CreateInvoiceModal({ open, clients, onClose, onSubmit }: CreateInvoiceModalProps) {
  return (
    <Modal title="Nueva factura" open={open} onClose={onClose}>
      <CreateInvoiceForm clients={clients} onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}
