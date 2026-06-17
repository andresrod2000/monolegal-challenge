import type { Client } from '@/types/client';

interface ClientTableProps {
  clients: Client[];
  invoiceCountByClient: Record<string, number>;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientTable({ clients, invoiceCountByClient, onEdit, onDelete }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="panel rounded-none p-16 text-center text-brand-muted">
        No hay clientes registrados.
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-neutral bg-surface-subtle text-brand-muted">
              <th className="px-5 py-5 font-medium">ID</th>
              <th className="px-5 py-5 font-medium">Nombre</th>
              <th className="px-5 py-5 font-medium">Email (destino recordatorios)</th>
              <th className="px-5 py-5 font-medium">Facturas</th>
              <th className="px-5 py-5 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-brand-neutral/60 transition-colors hover:bg-brand-light/20"
              >
                <td className="px-5 py-5 font-mono text-xs text-brand-muted">{client.id}</td>
                <td className="px-5 py-5 font-medium text-brand-dark">{client.name}</td>
                <td className="px-5 py-5 text-brand-muted">{client.email}</td>
                <td className="px-5 py-5 text-brand-dark">
                  {invoiceCountByClient[client.id] ?? 0}
                </td>
                <td className="px-5 py-5">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit(client)} className="btn-sm-ghost">
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(client)}
                      className="btn-sm border border-brand-muted text-brand-muted hover:border-brand-dark hover:text-brand-dark"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
