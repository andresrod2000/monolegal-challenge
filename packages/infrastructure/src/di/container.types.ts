import type { IEmailProvider } from '@monolegal/domain';
import type { IClientRepository } from '@monolegal/domain';
import type { IInvoiceRepository } from '@monolegal/domain';
import type { IInvoiceSeeder } from '@monolegal/domain';
import type { ILogger } from '@monolegal/domain';
import type {
  CreateClientUseCase,
  CreateInvoiceUseCase,
  DeleteClientUseCase,
  DeleteInvoiceUseCase,
  GetClientByIdUseCase,
  GetClientsUseCase,
  GetInvoiceByIdUseCase,
  GetInvoicesSummaryUseCase,
  ProcessInvoiceRemindersUseCase,
  UpdateClientUseCase,
  UpdateInvoiceUseCase,
} from '@monolegal/application';

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
  clientRepository: IClientRepository;
  invoiceRepository: IInvoiceRepository;
  invoiceSeeder: IInvoiceSeeder;
  emailProvider: IEmailProvider;
  processInvoiceRemindersUseCase: ProcessInvoiceRemindersUseCase;
  getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase;
  getInvoiceByIdUseCase: GetInvoiceByIdUseCase;
  createInvoiceUseCase: CreateInvoiceUseCase;
  updateInvoiceUseCase: UpdateInvoiceUseCase;
  deleteInvoiceUseCase: DeleteInvoiceUseCase;
  getClientsUseCase: GetClientsUseCase;
  getClientByIdUseCase: GetClientByIdUseCase;
  createClientUseCase: CreateClientUseCase;
  updateClientUseCase: UpdateClientUseCase;
  deleteClientUseCase: DeleteClientUseCase;
}

export interface ApiDependencies {
  logger: ILogger;
  getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase;
  getInvoiceByIdUseCase: GetInvoiceByIdUseCase;
  createInvoiceUseCase: CreateInvoiceUseCase;
  updateInvoiceUseCase: UpdateInvoiceUseCase;
  deleteInvoiceUseCase: DeleteInvoiceUseCase;
  getClientsUseCase: GetClientsUseCase;
  getClientByIdUseCase: GetClientByIdUseCase;
  createClientUseCase: CreateClientUseCase;
  updateClientUseCase: UpdateClientUseCase;
  deleteClientUseCase: DeleteClientUseCase;
}

export function toApiDependencies(container: Container): ApiDependencies {
  return {
    logger: container.logger,
    getInvoicesSummaryUseCase: container.getInvoicesSummaryUseCase,
    getInvoiceByIdUseCase: container.getInvoiceByIdUseCase,
    createInvoiceUseCase: container.createInvoiceUseCase,
    updateInvoiceUseCase: container.updateInvoiceUseCase,
    deleteInvoiceUseCase: container.deleteInvoiceUseCase,
    getClientsUseCase: container.getClientsUseCase,
    getClientByIdUseCase: container.getClientByIdUseCase,
    createClientUseCase: container.createClientUseCase,
    updateClientUseCase: container.updateClientUseCase,
    deleteClientUseCase: container.deleteClientUseCase,
  };
}

export type ContainerFactory = (config: ContainerConfig) => Promise<Container>;
