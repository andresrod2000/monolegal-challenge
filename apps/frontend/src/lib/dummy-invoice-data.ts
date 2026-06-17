export interface DummyInvoiceFields {
  concept: string;
  amount: number;
  dueDate: string;
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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateRandomConcept(): string {
  const template = CONCEPT_TEMPLATES[randomInt(0, CONCEPT_TEMPLATES.length - 1)];
  const month = MONTHS_ES[randomInt(0, MONTHS_ES.length - 1)];
  const year = new Date().getFullYear() + randomInt(0, 1);
  return `${template} — ${month} ${year}`;
}

function generateRandomAmount(): number {
  return randomInt(5, 90) * 10_000;
}

const MAX_DAYS_AHEAD = 7;

function randomDueDateInWindow(minOffset: number, maxOffset: number): Date {
  const today = startOfDay(new Date());
  return addDays(today, randomInt(minOffset, maxOffset));
}

function randomDueDateFromToday(maxDaysAhead = MAX_DAYS_AHEAD): Date {
  return randomDueDateInWindow(0, maxDaysAhead);
}

export function generateDummyInvoiceFormFields(): DummyInvoiceFields {
  const dueDate = randomDueDateFromToday();
  return {
    concept: generateRandomConcept(),
    amount: generateRandomAmount(),
    dueDate: formatDateInput(dueDate),
  };
}
