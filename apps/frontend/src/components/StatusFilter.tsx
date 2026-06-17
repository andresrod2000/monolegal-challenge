import { ALL_INVOICE_STATUSES, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { StatusFilter } from '@/types/invoice';

interface StatusFilterBarProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

const chipBase = 'rounded-sm border px-3 py-1.5 text-sm transition-colors';

const chipActive = 'border-brand-dark bg-brand-dark text-white';
const chipInactive =
  'border-brand-neutral bg-surface text-brand-muted hover:border-brand-medium hover:text-brand-dark';

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-brand-muted">Filtrar:</span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`${chipBase} ${value === 'all' ? chipActive : chipInactive}`}
      >
        Todos
      </button>
      {ALL_INVOICE_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`${chipBase} ${value === status ? chipActive : chipInactive}`}
        >
          {getInvoiceStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}
