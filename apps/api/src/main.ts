import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createContainer, disconnectMongoDB, loadConfigFromEnv } from '@monolegal/infrastructure';
import { createInvoicesRouter } from './routes/invoices.routes.js';

const PORT = Number(process.env.API_PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

async function main(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('api'));
  const app = express();

  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
  });

  app.use('/api/invoices', createInvoicesRouter(container));

  app.listen(PORT, () => {
    container.logger.info('API server started', { port: PORT, corsOrigin: CORS_ORIGIN });
  });

  const shutdown = async (): Promise<void> => {
    container.logger.info('Shutting down API server');
    await disconnectMongoDB();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
