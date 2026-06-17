import {
  GetInvoicesSummaryUseCase,
  ProcessInvoiceRemindersUseCase,
} from '@monolegal/application';
import { GmailEmailProvider } from '../email/gmail-email.provider.js';
import { MockEmailProvider } from '../email/mock-email.provider.js';
import { PinoLogger } from '../logger/pino.logger.js';
import { connectMongoDB, MongoInvoiceRepository } from '../persistence/mongo-invoice.repository.js';
import type { Container, ContainerConfig } from './container.types.js';

export async function createContainer(config: ContainerConfig): Promise<Container> {
  await connectMongoDB(config.mongodbUri);

  const logLevel = config.logLevel ?? 'info';
  const logger = new PinoLogger(config.serviceName, logLevel);

  const invoiceRepository = new MongoInvoiceRepository();

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

  const processInvoiceRemindersUseCase = new ProcessInvoiceRemindersUseCase(
    invoiceRepository,
    emailProvider,
    logger,
  );

  const getInvoicesSummaryUseCase = new GetInvoicesSummaryUseCase(invoiceRepository, logger);

  logger.info('Container initialized', {
    emailProvider: config.emailProvider,
    service: config.serviceName,
  });

  return {
    logger,
    invoiceRepository,
    emailProvider,
    processInvoiceRemindersUseCase,
    getInvoicesSummaryUseCase,
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
