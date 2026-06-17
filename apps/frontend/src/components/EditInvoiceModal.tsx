'use client';

import { useState } from 'react';
import { ALL_INVOICE_STATUSES, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { Invoice } from '@/types/invoice';
import type { InvoiceStatus } from '@/lib/invoice-status';
import { Modal } from './Modal';

interface EditInvoiceFormProps {
  invoice: Invoice;
  onSubmit: (data: {
    concept: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
  }) => Promise<void>;
  onClose: () => void;
}

function EditInvoiceForm({ invoice, onSubmit, onClose }: EditInvoiceFormProps) {
  const [concept, setConcept] = useState(invoice.concept);
  const [amount, setAmount] = useState(String(invoice.amount));
  const [dueDate, setDueDate] = useState(invoice.dueDate.slice(0, 10));
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        concept,
        amount: Number(amount),
        dueDate: new Date(dueDate).toISOString(),
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
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
      <p className="text-sm text-slate-400">
        {invoice.invoiceNumber} — {invoice.clientName}
      </p>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Concepto</label>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          required
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
        <label className="mb-1 block text-sm text-slate-400">Estado</label>
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
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

interface EditInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSubmit: (id: string, data: EditInvoiceFormProps['onSubmit'] extends (d: infer D) => unknown ? D : never) => Promise<void>;
}

export function EditInvoiceModal({ invoice, onClose, onSubmit }: EditInvoiceModalProps) {
  return (
    <Modal title="Editar factura" open={invoice !== null} onClose={onClose}>
      {invoice && (
        <EditInvoiceForm
          invoice={invoice}
          onSubmit={(data) => onSubmit(invoice.id, data)}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
