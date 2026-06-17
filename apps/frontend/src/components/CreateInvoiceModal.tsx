'use client';

import { useState } from 'react';
import { ALL_INVOICE_STATUSES, InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';
import { generateDummyInvoiceFormFields } from '@/lib/dummy-invoice-data';
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

  function handleGenerateDummyData() {
    const dummy = generateDummyInvoiceFormFields();
    setConcept(dummy.concept);
    setAmount(String(dummy.amount));
    setDueDate(dummy.dueDate);
  }

  if (clients.length === 0) {
    return <p className="text-brand-muted">Primero debe crear al menos un cliente.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}
      <div>
        <label className="form-label">Cliente</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          className="input-field"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="form-label mb-0">Concepto</label>
          <button type="button" onClick={handleGenerateDummyData} className="btn-sm-ghost">
            Generar dummy data
          </button>
        </div>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          required
          placeholder="Ej. Suscripción SaaS — Julio 2026"
          className="input-field"
        />
      </div>
      <div>
        <label className="form-label">Monto (COP)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={1}
          className="input-field"
        />
      </div>
      <div>
        <label className="form-label">Fecha de vencimiento</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="input-field"
        />
      </div>
      <div>
        <label className="form-label">Estado inicial</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
          className="input-field"
        >
          {ALL_INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getInvoiceStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
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
