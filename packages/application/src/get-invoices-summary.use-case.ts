import type { IInvoiceRepository, InvoiceSummary } from '@monolegal/domain';
import type { ILogger } from '@monolegal/shared';

export class GetInvoicesSummaryUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<InvoiceSummary[]> {
    this.logger.debug('Fetching invoices summary');
    const invoices = await this.invoiceRepository.findAll();
    this.logger.info('Invoices summary fetched', { count: invoices.length });
    return invoices;
  }
}
