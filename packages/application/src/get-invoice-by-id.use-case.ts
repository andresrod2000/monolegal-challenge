import { InvoiceNotFoundError, type IInvoiceRepository, type ILogger } from '@monolegal/domain';
import type { Invoice } from '@monolegal/domain';

export class GetInvoiceByIdUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }
    this.logger.debug('Invoice fetched', { invoiceId: id });
    return invoice;
  }
}
