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
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        No hay clientes registrados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Email (destino recordatorios)</th>
              <th className="px-6 py-4 font-medium">Facturas</th>
              <th className="px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-800/60 transition-colors hover:bg-slate-800/30"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{client.id}</td>
                <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                <td className="px-6 py-4 text-indigo-300">{client.email}</td>
                <td className="px-6 py-4 text-slate-300">
                  {invoiceCountByClient[client.id] ?? 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(client)}
                      className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-slate-600"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(client)}
                      className="rounded-lg bg-rose-900/50 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-900"
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
