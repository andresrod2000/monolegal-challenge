import { ALL_INVOICE_STATUSES, getInvoiceStatusLabel } from '@/lib/invoice-status';
import type { StatusFilter } from '@/types/invoice';

interface StatusFilterBarProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-400">Filtrar:</span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
          value === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        Todos
      </button>
      {ALL_INVOICE_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            value === status
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {getInvoiceStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}
