import { InvoiceStatus } from './invoice-status.js';

export const DUMMY_DATE_MIN_DAYS_OFFSET = -2;
export const DUMMY_DATE_MAX_DAYS_OFFSET = 7;

export interface DummyInvoiceFields {
  concept: string;
  amount: number;
  dueDate: Date;
}

const CONCEPT_TEMPLATES = [
  'Suscripción SaaS',
  'Soporte técnico',
  'Consultoría integración API',
  'Implementación módulo facturación',
  'Capacitación usuarios',
  'Mantenimiento mensual',
  'Licencias anuales',
  'Desarrollo personalizado reportes',
  'Migración de datos históricos',
  'Auditoría de cumplimiento',
];

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function diffDaysFromToday(dueDate: Date, today: Date = new Date()): number {
  const due = startOfDay(dueDate).getTime();
  const ref = startOfDay(today).getTime();
  return Math.round((due - ref) / (1000 * 60 * 60 * 24));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

export function randomDueDateFromToday(options?: {
  minDaysAhead?: number;
  maxDaysAhead?: number;
  today?: Date;
}): Date {
  const today = startOfDay(options?.today ?? new Date());
  const minDays = options?.minDaysAhead ?? 0;
  const maxDays = options?.maxDaysAhead ?? DUMMY_DATE_MAX_DAYS_OFFSET;
  return addDays(today, randomInt(minDays, maxDays));
}

export function randomDueDateFromTwoDaysAgo(options?: {
  maxDaysAhead?: number;
  today?: Date;
}): Date {
  const today = startOfDay(options?.today ?? new Date());
  const maxDays = options?.maxDaysAhead ?? DUMMY_DATE_MAX_DAYS_OFFSET;
  return addDays(today, randomInt(DUMMY_DATE_MIN_DAYS_OFFSET, maxDays));
}

export function generateRandomConcept(): string {
  const template = CONCEPT_TEMPLATES[randomInt(0, CONCEPT_TEMPLATES.length - 1)];
  const month = MONTHS_ES[randomInt(0, MONTHS_ES.length - 1)];
  const year = new Date().getFullYear() + randomInt(0, 1);
  return `${template} — ${month} ${year}`;
}

export function generateRandomAmount(): number {
  const steps = randomInt(5, 90);
  return steps * 10_000;
}

export function generateDummyInvoiceFields(
  mode: 'seed' | 'form',
  options?: { maxDaysAhead?: number; today?: Date },
): DummyInvoiceFields {
  const dueDate =
    mode === 'seed'
      ? randomDueDateFromTwoDaysAgo({ maxDaysAhead: options?.maxDaysAhead, today: options?.today })
      : randomDueDateFromToday({ maxDaysAhead: options?.maxDaysAhead, today: options?.today });

  return {
    concept: generateRandomConcept(),
    amount: generateRandomAmount(),
    dueDate,
  };
}

export function deriveStatusFromDueDate(dueDate: Date, today?: Date): InvoiceStatus {
  const diffDays = diffDaysFromToday(dueDate, today);

  if (diffDays >= 0) {
    return InvoiceStatus.AL_DIA;
  }
  if (diffDays >= -7) {
    return InvoiceStatus.PRIMER_RECORDATORIO;
  }
  if (diffDays >= -21) {
    return InvoiceStatus.SEGUNDO_RECORDATORIO;
  }
  return InvoiceStatus.DESACTIVADO;
}
