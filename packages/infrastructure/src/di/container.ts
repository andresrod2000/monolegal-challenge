import {
  CreateClientUseCase,
  CreateInvoiceUseCase,
  DeleteClientUseCase,
  DeleteInvoiceUseCase,
  GetClientByIdUseCase,
  GetClientsUseCase,
  GetInvoiceByIdUseCase,
  GetInvoicesSummaryUseCase,
  ProcessInvoiceRemindersUseCase,
  ProcessOverdueInvoicesUseCase,
  UpdateClientUseCase,
  UpdateInvoiceUseCase,
} from '@monolegal/application';
import { GmailEmailProvider } from '../email/gmail-email.provider.js';
import { MockEmailProvider } from '../email/mock-email.provider.js';
import { PinoLogger } from '../logger/pino.logger.js';
import { MongoClientRepository } from '../persistence/mongo-client.repository.js';
import { connectMongoDB, MongoInvoiceRepository } from '../persistence/mongo-invoice.repository.js';
import { MongoInvoiceSeeder } from '../persistence/mongo-invoice.seeder.js';
import type { Container, ContainerConfig } from './container.types.js';

export async function createContainer(config: ContainerConfig): Promise<Container> {
  await connectMongoDB(config.mongodbUri);

  const logLevel = config.logLevel ?? 'info';
  const logger = new PinoLogger(config.serviceName, logLevel);

  const clientRepository = new MongoClientRepository();
  const invoiceRepository = new MongoInvoiceRepository();
  const invoiceSeeder = new MongoInvoiceSeeder();

  const emailProvider =
    config.emailProvider === 'gmail'
      ? new GmailEmailProvider(
          {
            user: config.gmailUser ?? '',
            appPassword: config.gmailAppPassword ?? '',
          },
          logger,
        )
      : new MockEmailProvider(logger);

  const processOverdueInvoicesUseCase = new ProcessOverdueInvoicesUseCase(
    invoiceRepository,
    logger,
  );

  const processInvoiceRemindersUseCase = new ProcessInvoiceRemindersUseCase(
    invoiceRepository,
    clientRepository,
    emailProvider,
    logger,
  );

  const getInvoicesSummaryUseCase = new GetInvoicesSummaryUseCase(invoiceRepository, logger);
  const getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceRepository, logger);
  const createInvoiceUseCase = new CreateInvoiceUseCase(
    invoiceRepository,
    clientRepository,
    logger,
  );
  const updateInvoiceUseCase = new UpdateInvoiceUseCase(invoiceRepository, logger);
  const deleteInvoiceUseCase = new DeleteInvoiceUseCase(invoiceRepository, logger);

  const getClientsUseCase = new GetClientsUseCase(clientRepository, logger);
  const getClientByIdUseCase = new GetClientByIdUseCase(clientRepository, logger);
  const createClientUseCase = new CreateClientUseCase(clientRepository, logger);
  const updateClientUseCase = new UpdateClientUseCase(clientRepository, logger);
  const deleteClientUseCase = new DeleteClientUseCase(clientRepository, invoiceRepository, logger);

  logger.info('Container initialized', {
    emailProvider: config.emailProvider,
    service: config.serviceName,
  });

  return {
    logger,
    clientRepository,
    invoiceRepository,
    invoiceSeeder,
    emailProvider,
    processOverdueInvoicesUseCase,
    processInvoiceRemindersUseCase,
    getInvoicesSummaryUseCase,
    getInvoiceByIdUseCase,
    createInvoiceUseCase,
    updateInvoiceUseCase,
    deleteInvoiceUseCase,
    getClientsUseCase,
    getClientByIdUseCase,
    createClientUseCase,
    updateClientUseCase,
    deleteClientUseCase,
  };
}

export function loadConfigFromEnv(serviceName: string): ContainerConfig {
  return {
    mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/monolegal',
    emailProvider: process.env.EMAIL_PROVIDER === 'gmail' ? 'gmail' : 'mock',
    gmailUser: process.env.GMAIL_USER,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    serviceName,
    logLevel: (process.env.LOG_LEVEL as ContainerConfig['logLevel']) ?? 'info',
  };
}
