import { InvoiceStatus } from '@monolegal/shared';
import {
  Invoice,
  InvoiceTransitionError,
  InvoiceValidationError,
} from '../index.js';

const validProps = {
  id: 'inv-1',
  clientId: 'client-1',
  clientName: 'Acme Corp',
  clientEmail: 'billing@acme.com',
  amount: 150000,
  dueDate: new Date('2026-05-01'),
  status: InvoiceStatus.PRIMER_RECORDATORIO,
};

describe('Invoice.create', () => {
  it('should create a valid invoice', () => {
    const invoice = Invoice.create(validProps);
    expect(invoice.id).toBe('inv-1');
    expect(invoice.status).toBe(InvoiceStatus.PRIMER_RECORDATORIO);
  });

  it('should throw InvoiceValidationError when id is empty', () => {
    expect(() => Invoice.create({ ...validProps, id: '' })).toThrow(InvoiceValidationError);
    expect(() => Invoice.create({ ...validProps, id: '  ' })).toThrow('Invoice id is required');
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
    const payload = invoice.buildReminderPayload();

    expect(payload.nextStatus).toBe(InvoiceStatus.SEGUNDO_RECORDATORIO);
    expect(payload.email.subject).toContain('Recordatorio de pago');
    expect(payload.email.body).toContain('Acme Corp');
  });

  it('should build second reminder email and next status', () => {
    const invoice = Invoice.create({ ...validProps, status: InvoiceStatus.SEGUNDO_RECORDATORIO });
    const payload = invoice.buildReminderPayload();

    expect(payload.nextStatus).toBe(InvoiceStatus.DESACTIVADO);
    expect(payload.email.subject).toContain('Desactivación inminente');
    expect(payload.email.body).toContain('segundo y último recordatorio');
  });
});
