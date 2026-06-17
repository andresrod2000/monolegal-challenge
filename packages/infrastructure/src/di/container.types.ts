import type { IEmailProvider } from '@monolegal/domain';
import type { IInvoiceRepository } from '@monolegal/domain';
import type { ILogger } from '@monolegal/shared';
import type { ProcessInvoiceRemindersUseCase } from '@monolegal/application';
import type { GetInvoicesSummaryUseCase } from '@monolegal/application';

export interface ContainerConfig {
  mongodbUri: string;
  emailProvider: 'mock' | 'gmail';
  gmailUser?: string;
  gmailAppPassword?: string;
  serviceName: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface Container {
  logger: ILogger;
  invoiceRepository: IInvoiceRepository;
  emailProvider: IEmailProvider;
  processInvoiceRemindersUseCase: ProcessInvoiceRemindersUseCase;
  getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase;
}

export type ContainerFactory = (config: ContainerConfig) => Promise<Container>;
