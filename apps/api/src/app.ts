import cors from 'cors';
import express, { type Express } from 'express';
import type { ApiDependencies } from '@monolegal/infrastructure';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRequestContextMiddleware } from './middleware/request-context.js';
import { createClientsRouter } from './routes/clients.routes.js';
import { createInvoicesRouter } from './routes/invoices.routes.js';

export interface ApiAppDependencies extends ApiDependencies {
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

  app.use(
    '/api/clients',
    createClientsRouter({
      getClientsUseCase: deps.getClientsUseCase,
      getClientByIdUseCase: deps.getClientByIdUseCase,
      createClientUseCase: deps.createClientUseCase,
      updateClientUseCase: deps.updateClientUseCase,
      deleteClientUseCase: deps.deleteClientUseCase,
    }),
  );

  app.use(
    '/api/invoices',
    createInvoicesRouter({
      getInvoicesSummaryUseCase: deps.getInvoicesSummaryUseCase,
      getInvoiceByIdUseCase: deps.getInvoiceByIdUseCase,
      createInvoiceUseCase: deps.createInvoiceUseCase,
      updateInvoiceUseCase: deps.updateInvoiceUseCase,
      deleteInvoiceUseCase: deps.deleteInvoiceUseCase,
    }),
  );

  app.use(notFoundHandler);
  app.use(createErrorHandler(deps.logger));

  return app;
}
