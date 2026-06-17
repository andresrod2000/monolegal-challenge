import { InvoiceStatus, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { StatusFilter } from '@/types/invoice';

interface KpiCardProps {
  status: InvoiceStatus;
  count: number;
  active: boolean;
  onClick: (status: StatusFilter) => void;
}

const accentColors: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'border-emerald-500/40 hover:border-emerald-400',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'border-amber-500/40 hover:border-amber-400',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'border-orange-500/40 hover:border-orange-400',
  [InvoiceStatus.DESACTIVADO]: 'border-rose-500/40 hover:border-rose-400',
};

const activeRing: Record<InvoiceStatus, string> = {
  [InvoiceStatus.AL_DIA]: 'ring-emerald-400',
  [InvoiceStatus.PRIMER_RECORDATORIO]: 'ring-amber-400',
  [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'ring-orange-400',
  [InvoiceStatus.DESACTIVADO]: 'ring-rose-400',
};

export function KpiCard({ status, count, active, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(status)}
      className={`rounded-xl border bg-slate-900/60 p-5 text-left transition-all ${accentColors[status]} ${
        active ? `ring-2 ${activeRing[status]}` : ''
      }`}
    >
      <p className="text-sm text-slate-400">{getInvoiceStatusLabel(status)}</p>
      <p className="mt-2 text-3xl font-bold text-white">{count}</p>
    </button>
  );
}
