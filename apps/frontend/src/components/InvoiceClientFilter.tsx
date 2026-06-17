import type { Client } from '@/types/client';
import type { ClientFilter } from '@/types/invoice';

interface InvoiceClientFilterProps {
  clients: Client[];
  value: ClientFilter;
  onChange: (clientId: ClientFilter) => void;
}

export function InvoiceClientFilter({ clients, value, onChange }: InvoiceClientFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-400">Cliente:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ClientFilter)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
      >
        <option value="all">Todos los clientes</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}
