import { InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';

const statusStyles: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'bg-brand-light/50 text-brand-dark border-brand-light',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'bg-surface-subtle text-brand-medium border-brand-medium/40',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'bg-surface-subtle text-brand-muted border-brand-muted/50',
  [InvoiceStatus.DESACTIVADO]: 'bg-surface-subtle text-brand-neutral border-brand-neutral',
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {getInvoiceStatusLabel(status)}
    </span>
  );
}
