import { InvoiceStatus } from '@monolegal/shared';
import {
  Invoice,
  InvoiceTransitionError,
  InvoiceValidationError,
} from '../index.js';

const validProps = {
  id: 'inv-1',
  clientId: 'client-1',
  invoiceNumber: 'INV-2026-0001',
  concept: 'Suscripción SaaS — Marzo 2026',
  amount: 150000,
  dueDate: new Date('2026-05-01'),
  status: InvoiceStatus.PRIMER_RECORDATORIO,
};

describe('Invoice.create', () => {
  it('should create a valid invoice', () => {
    const invoice = Invoice.create(validProps);
    expect(invoice.id).toBe('inv-1');
    expect(invoice.invoiceNumber).toBe('INV-2026-0001');
    expect(invoice.concept).toBe('Suscripción SaaS — Marzo 2026');
    expect(invoice.status).toBe(InvoiceStatus.PRIMER_RECORDATORIO);
  });

  it('should throw InvoiceValidationError when id is empty', () => {
    expect(() => Invoice.create({ ...validProps, id: '' })).toThrow(InvoiceValidationError);
    expect(() => Invoice.create({ ...validProps, id: '  ' })).toThrow('Invoice id is required');
  });

  it('should throw InvoiceValidationError when concept is empty', () => {
    expect(() => Invoice.create({ ...validProps, concept: '' })).toThrow(InvoiceValidationError);
  });

  it('should throw InvoiceValidationError when amount is zero or negative', () => {
    expect(() => Invoice.create({ ...validProps, amount: 0 })).toThrow(InvoiceValidationError);
    expect(() => Invoice.create({ ...validProps, amount: -100 })).toThrow(
      'Invoice amount must be greater than zero',
    );
  });

  it('should throw InvoiceValidationError for invalid status', () => {
    expect(() =>
      Invoice.create({ ...validProps, status: 'invalid' as InvoiceStatus }),
    ).toThrow(InvoiceValidationError);
  });
});

describe('Invoice overdue transitions', () => {
  const today = new Date('2026-06-16');

  it('should not be overdue on the due date', () => {
    const invoice = Invoice.create({
      ...validProps,
      dueDate: new Date('2026-06-16'),
      status: InvoiceStatus.AL_DIA,
    });
    expect(invoice.isOverdueAt(today)).toBe(false);
    expect(invoice.shouldTransitionToFirstReminder(today)).toBe(false);
  });

  it('should be overdue the day after the due date', () => {
    const invoice = Invoice.create({
      ...validProps,
      dueDate: new Date('2026-06-15'),
      status: InvoiceStatus.AL_DIA,
    });
    expect(invoice.isOverdueAt(today)).toBe(true);
    expect(invoice.shouldTransitionToFirstReminder(today)).toBe(true);
    expect(invoice.getStatusAfterBecomingOverdue()).toBe(InvoiceStatus.PRIMER_RECORDATORIO);
  });

  it('should not be overdue when due date is in the future', () => {
    const invoice = Invoice.create({
      ...validProps,
      dueDate: new Date('2026-06-20'),
      status: InvoiceStatus.AL_DIA,
    });
    expect(invoice.isOverdueAt(today)).toBe(false);
    expect(invoice.shouldTransitionToFirstReminder(today)).toBe(false);
  });

  it('should not transition when already in reminder status even if overdue', () => {
    const invoice = Invoice.create({
      ...validProps,
      dueDate: new Date('2026-06-01'),
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    });
    expect(invoice.isOverdueAt(today)).toBe(true);
    expect(invoice.shouldTransitionToFirstReminder(today)).toBe(false);
  });
});

describe('Invoice transitions', () => {
  it('should transition from primer recordatorio to segundo recordatorio', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.PRIMER_RECORDATORIO });
    expect(invoice.getNextStatusAfterReminder()).toBe(InvoiceStatus.SEGUNDO_RECORDATORIO);
  });

  it('should transition from segundo recordatorio to desactivado', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.SEGUNDO_RECORDATORIO });
    expect(invoice.getNextStatusAfterReminder()).toBe(InvoiceStatus.DESACTIVADO);
  });

  it('should throw InvoiceTransitionError for al_dia status', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.AL_DIA });
    expect(() => invoice.getNextStatusAfterReminder()).toThrow(InvoiceTransitionError);
  });
});

describe('Invoice.buildReminderPayload', () => {
  it('should build first reminder email and next status', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.PRIMER_RECORDATORIO });
    const payload = invoice.buildReminderPayload('Acme Corp');

    expect(payload.nextStatus).toBe(InvoiceStatus.SEGUNDO_RECORDATORIO);
    expect(payload.email.subject).toContain('Recordatorio de pago');
    expect(payload.email.subject).toContain('INV-2026-0001');
    expect(payload.email.body).toContain('Acme Corp');
    expect(payload.email.body).toContain('Suscripción SaaS — Marzo 2026');
  });

  it('should build second reminder email and next status', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.SEGUNDO_RECORDATORIO });
    const payload = invoice.buildReminderPayload('Acme Corp');

    expect(payload.nextStatus).toBe(InvoiceStatus.DESACTIVADO);
    expect(payload.email.subject).toContain('Desactivación inminente');
    expect(payload.email.body).toContain('segundo y último recordatorio');
  });
});
