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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}
      <p className="text-sm text-brand-muted">
        {invoice.invoiceNumber} — {invoice.clientName}
      </p>
      <div>
        <label className="form-label">Concepto</label>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          required
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
        <label className="form-label">Estado</label>
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
