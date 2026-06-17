import { InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { StatusFilter } from '@/types/invoice';

interface KpiCardProps {
  status: InvoiceStatus;
  count: number;
  active: boolean;
  onClick: (status: StatusFilter) => void;
}

const borderStyles: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'border-brand-neutral hover:bg-brand-light/30',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'border-brand-medium/50 hover:bg-brand-light/20',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'border-brand-muted hover:bg-surface-subtle',
  [InvoiceStatus.DESACTIVADO]: 'border-brand-neutral/50 hover:bg-surface-subtle',
};

const activeStyles: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'border-2 border-brand-accent bg-brand-light/40',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'border-2 border-brand-medium bg-brand-light/30',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'border-2 border-brand-dark/30 bg-surface-subtle',
  [InvoiceStatus.DESACTIVADO]: 'border-2 border-brand-neutral bg-surface-subtle',
};

export function KpiCard({ status, count, active, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(status)}
      className={`rounded-sm border bg-surface p-6 text-left transition-colors ${
        active ? activeStyles[status] : borderStyles[status]
      }`}
    >
      <p className="text-sm text-brand-muted">{getInvoiceStatusLabel(status)}</p>
      <p className="mt-3 text-3xl font-semibold text-brand-dark">{count}</p>
    </button>
  );
}
