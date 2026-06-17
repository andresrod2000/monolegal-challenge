import 'dotenv/config';
import {
  createContainer,
  disconnectMongoDB,
  loadConfigFromEnv,
  MongoInvoiceSeeder,
} from '@monolegal/infrastructure';
import type { SeedInvoiceInput } from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';

interface SeedClient {
  id: string;
  name: string;
  email: string;
}

const clients: SeedClient[] = [
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
      clientName: clients[0].name,
      clientEmail: clients[0].email,
      amount: 250000,
      dueDate: daysAgo(5),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[0].id,
      clientName: clients[0].name,
      clientEmail: clients[0].email,
      amount: 180000,
      dueDate: daysAgo(15),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[0].id,
      clientName: clients[0].name,
      clientEmail: clients[0].email,
      amount: 320000,
      dueDate: daysAgo(30),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[0].id,
      clientName: clients[0].name,
      clientEmail: clients[0].email,
      amount: 95000,
      dueDate: daysAgo(-10),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[0].id,
      clientName: clients[0].name,
      clientEmail: clients[0].email,
      amount: 410000,
      dueDate: daysAgo(2),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[1].id,
      clientName: clients[1].name,
      clientEmail: clients[1].email,
      amount: 520000,
      dueDate: daysAgo(8),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[1].id,
      clientName: clients[1].name,
      clientEmail: clients[1].email,
      amount: 275000,
      dueDate: daysAgo(20),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[1].id,
      clientName: clients[1].name,
      clientEmail: clients[1].email,
      amount: 150000,
      dueDate: daysAgo(-5),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[1].id,
      clientName: clients[1].name,
      clientEmail: clients[1].email,
      amount: 890000,
      dueDate: daysAgo(45),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[1].id,
      clientName: clients[1].name,
      clientEmail: clients[1].email,
      amount: 340000,
      dueDate: daysAgo(1),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      clientName: clients[2].name,
      clientEmail: clients[2].email,
      amount: 125000,
      dueDate: daysAgo(12),
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      clientName: clients[2].name,
      clientEmail: clients[2].email,
      amount: 670000,
      dueDate: daysAgo(-15),
      status: InvoiceStatus.AL_DIA,
    },
    {
      clientId: clients[2].id,
      clientName: clients[2].name,
      clientEmail: clients[2].email,
      amount: 98000,
      dueDate: daysAgo(3),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    },
    {
      clientId: clients[2].id,
      clientName: clients[2].name,
      clientEmail: clients[2].email,
      amount: 445000,
      dueDate: daysAgo(60),
      status: InvoiceStatus.DESACTIVADO,
    },
    {
      clientId: clients[2].id,
      clientName: clients[2].name,
      clientEmail: clients[2].email,
      amount: 210000,
      dueDate: daysAgo(-7),
      status: InvoiceStatus.AL_DIA,
    },
  ];
}

async function seed(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('seed'));
  const seeder = new MongoInvoiceSeeder();
  const invoices = buildInvoices();
  const inserted = await seeder.resetAndSeed(invoices);

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
