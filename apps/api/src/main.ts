import 'dotenv/config';
import { createContainer, disconnectMongoDB, loadConfigFromEnv, toApiDependencies } from '@monolegal/infrastructure';
import { createApp } from './app.js';

const PORT = Number(process.env.API_PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

async function main(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('api'));
  const apiDeps = toApiDependencies(container);
  const app = createApp({ ...apiDeps, corsOrigin: CORS_ORIGIN });

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
