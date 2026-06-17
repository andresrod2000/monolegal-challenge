import {
  Invoice,
  InvoiceNotFoundError,
  type InvoiceUpdateProps,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';

export class UpdateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string, input: InvoiceUpdateProps): Promise<Invoice> {
    const existing = await this.invoiceRepository.findById(id);
    if (!existing) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }

    const merged = { ...existing.toProps(), ...input };
    Invoice.create(merged);

    const invoice = await this.invoiceRepository.update(id, input);
    this.logger.info('Invoice updated', { invoiceId: id });
    return invoice;
  }
}
