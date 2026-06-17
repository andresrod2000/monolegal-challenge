import type { Client } from '@/types/client';
import type { ClientFilter } from '@/types/invoice';

interface InvoiceClientFilterProps {
  clients: Client[];
  value: ClientFilter;
  onChange: (clientId: ClientFilter) => void;
}

export function InvoiceClientFilter({ clients, value, onChange }: InvoiceClientFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-brand-muted">Cliente:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ClientFilter)}
        className="input-field w-auto min-w-[200px] py-1.5 text-sm"
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
