import { InvoiceStatus, isValidInvoiceStatus } from '@monolegal/shared';
import { InvoiceTransitionError, InvoiceValidationError } from '../errors/index.js';
import type { InvoiceProps } from './invoice.types.js';

export interface ReminderEmail {
  subject: string;
  body: string;
}

export interface ReminderPayload {
  email: ReminderEmail;
  nextStatus: InvoiceStatus;
}

export class Invoice {
  readonly id: string;
  readonly clientId: string;
  readonly invoiceNumber: string;
  readonly concept: string;
  readonly amount: number;
  readonly dueDate: Date;
  readonly status: InvoiceStatus;

  private constructor(props: InvoiceProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.invoiceNumber = props.invoiceNumber;
    this.concept = props.concept;
    this.amount = props.amount;
    this.dueDate = props.dueDate;
    this.status = props.status;
  }

  static create(props: InvoiceProps): Invoice {
    if (!props.id?.trim()) {
      throw new InvoiceValidationError('Invoice id is required');
    }
    if (!props.clientId?.trim()) {
      throw new InvoiceValidationError('Invoice clientId is required');
    }
    if (!props.invoiceNumber?.trim()) {
      throw new InvoiceValidationError('Invoice invoiceNumber is required');
    }
    if (!props.concept?.trim()) {
      throw new InvoiceValidationError('Invoice concept is required');
    }
    if (props.amount <= 0) {
      throw new InvoiceValidationError('Invoice amount must be greater than zero');
    }
    if (!isValidInvoiceStatus(props.status)) {
      throw new InvoiceValidationError(`Invalid invoice status: ${props.status}`);
    }
    return new Invoice(props);
  }

  static fromProps(props: InvoiceProps): Invoice {
    return Invoice.create(props);
  }

  toProps(): InvoiceProps {
    return {
      id: this.id,
      clientId: this.clientId,
      invoiceNumber: this.invoiceNumber,
      concept: this.concept,
      amount: this.amount,
      dueDate: this.dueDate,
      status: this.status,
    };
  }

  canSendFirstReminder(): boolean {
    return this.status === InvoiceStatus.PRIMER_RECORDATORIO;
  }

  canSendSecondReminder(): boolean {
    return this.status === InvoiceStatus.SEGUNDO_RECORDATORIO;
  }

  getNextStatusAfterReminder(): InvoiceStatus {
    if (this.canSendFirstReminder()) {
      return InvoiceStatus.SEGUNDO_RECORDATORIO;
    }
    if (this.canSendSecondReminder()) {
      return InvoiceStatus.DESACTIVADO;
    }
    throw new InvoiceTransitionError(`Invoice ${this.id} is not eligible for reminder processing`);
  }

  buildReminderPayload(clientName: string): ReminderPayload {
    const nextStatus = this.getNextStatusAfterReminder();
    const email = this.canSendFirstReminder()
      ? this.buildFirstReminderEmail(clientName)
      : this.buildSecondReminderEmail(clientName);

    return { email, nextStatus };
  }

  buildFirstReminderEmail(clientName: string): ReminderEmail {
    return {
      subject: `Recordatorio de pago — ${this.invoiceNumber} — ${clientName}`,
      body: [
        `Estimado/a ${clientName},`,
        '',
        `Le informamos que su factura ${this.invoiceNumber} (${this.concept}) por $${this.formatAmount()} con vencimiento el ${this.formatDueDate()} se encuentra pendiente de pago.`,
        '',
        'Este es su primer recordatorio. Si no realiza el pago, recibirá un segundo aviso y posteriormente su servicio será desactivado.',
        '',
        'Atentamente,',
        'Equipo Monolegal',
      ].join('\n'),
    };
  }

  buildSecondReminderEmail(clientName: string): ReminderEmail {
    return {
      subject: `Último aviso — Desactivación inminente — ${this.invoiceNumber} — ${clientName}`,
      body: [
        `Estimado/a ${clientName},`,
        '',
        `Su factura ${this.invoiceNumber} (${this.concept}) por $${this.formatAmount()} con vencimiento el ${this.formatDueDate()} continúa impaga.`,
        '',
        'Este es su segundo y último recordatorio. De no recibir el pago, su servicio será desactivado.',
        '',
        'Atentamente,',
        'Equipo Monolegal',
      ].join('\n'),
    };
  }

  private formatAmount(): string {
    return this.amount.toLocaleString('es-CO');
  }

  private formatDueDate(): string {
    return this.dueDate.toLocaleDateString('es-CO');
  }
}
