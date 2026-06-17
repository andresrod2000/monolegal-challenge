import { InvoiceNotFoundError, type IInvoiceRepository, type ILogger } from '@monolegal/domain';

export class DeleteInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.invoiceRepository.findById(id);
    if (!existing) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }

    await this.invoiceRepository.delete(id);
    this.logger.info('Invoice deleted', { invoiceId: id });
  }
}
