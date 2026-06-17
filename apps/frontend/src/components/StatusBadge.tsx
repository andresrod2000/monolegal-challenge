import { InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';

const statusStyles: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  [InvoiceStatus.DESACTIVADO]: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {getInvoiceStatusLabel(status)}
    </span>
  );
}
