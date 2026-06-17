export enum InvoiceStatus {
  AL_DIA = 'al_dia',
  PRIMER_RECORDATORIO = 'primerrecordatorio',
  SEGUNDO_RECORDATORIO = 'segundorecordatorio',
  DESACTIVADO = 'desactivado',
}

export const ALL_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.AL_DIA,
  InvoiceStatus.PRIMER_RECORDATORIO,
  InvoiceStatus.SEGUNDO_RECORDATORIO,
  InvoiceStatus.DESACTIVADO,
];

export const REMINDER_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.PRIMER_RECORDATORIO,
  InvoiceStatus.SEGUNDO_RECORDATORIO,
];

export function canProcessReminder(status: InvoiceStatus): boolean {
  return REMINDER_STATUSES.includes(status);
}

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.AL_DIA]: 'Al día',
    [InvoiceStatus.PRIMER_RECORDATORIO]: 'Primer recordatorio',
    [InvoiceStatus.SEGUNDO_RECORDATORIO]: 'Segundo recordatorio',
    [InvoiceStatus.DESACTIVADO]: 'Desactivado',
  };
  return labels[status];
}
