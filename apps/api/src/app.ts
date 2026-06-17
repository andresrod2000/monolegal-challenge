import cors from 'cors';
import express, { type Express } from 'express';
import type { GetInvoicesSummaryUseCase } from '@monolegal/application';
import type { ILogger } from '@monolegal/domain';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRequestContextMiddleware } from './middleware/request-context.js';
import { createInvoicesRouter } from './routes/invoices.routes.js';

export interface ApiAppDependencies {
  getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase;
  logger: ILogger;
  corsOrigin: string;
}

export function createApp(deps: ApiAppDependencies): Express {
  const app = express();

  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json());
  app.use(createRequestContextMiddleware(deps.logger));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
  });

  app.use('/api/invoices', createInvoicesRouter(deps.getInvoicesSummaryUseCase));

  app.use(notFoundHandler);
  app.use(createErrorHandler(deps.logger));

  return app;
}
