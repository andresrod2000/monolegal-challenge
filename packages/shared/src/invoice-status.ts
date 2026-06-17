export enum InvoiceStatus {
  AL_DIA = 'al_dia',
  PRIMER_RECORDATORIO = 'primerrecordatorio',
  SEGUNDO_RECORDATORIO = 'segundorecordatorio',
  DESACTIVADO = 'desactivado',
}

export const REMINDER_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.PRIMER_RECORDATORIO,
  InvoiceStatus.SEGUNDO_RECORDATORIO,
];

export const ALL_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.AL_DIA,
  InvoiceStatus.PRIMER_RECORDATORIO,
  InvoiceStatus.SEGUNDO_RECORDATORIO,
  InvoiceStatus.DESACTIVADO,
];

export function isValidInvoiceStatus(value: string): value is InvoiceStatus {
  return ALL_INVOICE_STATUSES.includes(value as InvoiceStatus);
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
