import type { InvoiceStatus } from '@monolegal/shared';
import {
  ClientNotFoundError,
  Invoice,
  type IClientRepository,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';

export interface CreateInvoiceInput {
  clientId: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export class CreateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly clientRepository: IClientRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: CreateInvoiceInput): Promise<Invoice> {
    const clientExists = await this.clientRepository.exists(input.clientId);
    if (!clientExists) {
      throw new ClientNotFoundError(`Client not found: ${input.clientId}`);
    }

    const year = input.dueDate.getFullYear();
    const count = await this.invoiceRepository.countByYear(year);
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await this.invoiceRepository.create({
      clientId: input.clientId,
      invoiceNumber,
      concept: input.concept,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
    });

    Invoice.create(invoice.toProps());
    this.logger.info('Invoice created', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientId: input.clientId,
    });
    return invoice;
  }
}
