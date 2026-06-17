import 'dotenv/config';
import { createContainer, disconnectMongoDB, loadConfigFromEnv } from '@monolegal/infrastructure';
import type { SeedClientInput, SeedInvoiceInput } from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';

const clients: SeedClientInput[] = [
  { id: 'client-acme', name: 'Acme Corp', email: 'billing@acme.com' },
  { id: 'client-legaltech', name: 'LegalTech SA', email: 'finanzas@legaltech.co' },
  { id: 'client-consultores', name: 'Consultores XYZ', email: 'pagos@consultoresxyz.com' },
];

function buildInvoices(): SeedInvoiceInput[] {
  const now = new Date();
  const daysAgo = (days: number): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  return [
    {
      clientId: clients[0].id,
      invoiceNumber: 'INV-2026-0001',
      concept: 'Suscripción SaaS — Marzo 2026',
      amount: 250000,
      dueDate: daysAgo(5),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[0].id,
      invoiceNumber: 'INV-2026-0002',
      concept: 'Implementación módulo facturación',
      amount: 180000,
      dueDate: daysAgo(15),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[0].id,
      invoiceNumber: 'INV-2026-0003',
      concept: 'Soporte premium — Q1 2026',
      amount: 320000,
      dueDate: daysAgo(30),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[0].id,
      invoiceNumber: 'INV-2026-0004',
      concept: 'Suscripción SaaS — Junio 2026',
      amount: 95000,
      dueDate: daysAgo(-10),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[0].id,
      invoiceNumber: 'INV-2026-0005',
      concept: 'Capacitación usuarios',
      amount: 410000,
      dueDate: daysAgo(2),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[1].id,
      invoiceNumber: 'INV-2026-0006',
      concept: 'Licencias anuales — LegalTech',
      amount: 520000,
      dueDate: daysAgo(8),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[1].id,
      invoiceNumber: 'INV-2026-0007',
      concept: 'Consultoría integración API',
      amount: 275000,
      dueDate: daysAgo(20),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[1].id,
      invoiceNumber: 'INV-2026-0008',
      concept: 'Suscripción SaaS — Mayo 2026',
      amount: 150000,
      dueDate: daysAgo(-5),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[1].id,
      invoiceNumber: 'INV-2026-0009',
      concept: 'Migración de datos históricos',
      amount: 890000,
      dueDate: daysAgo(45),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[1].id,
      invoiceNumber: 'INV-2026-0010',
      concept: 'Mantenimiento mensual — Abril',
      amount: 340000,
      dueDate: daysAgo(1),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      invoiceNumber: 'INV-2026-0011',
      concept: 'Suscripción SaaS — Abril 2026',
      amount: 125000,
      dueDate: daysAgo(12),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      invoiceNumber: 'INV-2026-0012',
      concept: 'Desarrollo personalizado reportes',
      amount: 670000,
      dueDate: daysAgo(-15),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[2].id,
      invoiceNumber: 'INV-2026-0013',
      concept: 'Soporte técnico — Marzo',
      amount: 98000,
      dueDate: daysAgo(3),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      invoiceNumber: 'INV-2026-0014',
      concept: 'Auditoría de cumplimiento',
      amount: 445000,
      dueDate: daysAgo(60),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[2].id,
      invoiceNumber: 'INV-2026-0015',
      concept: 'Suscripción SaaS — Julio 2026',
      amount: 210000,
      dueDate: daysAgo(-7),
      status: InvoiceStatus.AL_DIA,
    },
  ];
}

async function seed(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('seed'));
  const invoices = buildInvoices();
  const inserted = await container.invoiceSeeder.resetAndSeed(clients, invoices);

  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1;
    return acc;
  }, {});

  container.logger.info('Seed completed', {
    clients: clients.length,
    invoices: inserted,
    statusDistribution: statusCounts,
  });

  await disconnectMongoDB();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  disconnectMongoDB().finally(() => process.exit(1));
});
