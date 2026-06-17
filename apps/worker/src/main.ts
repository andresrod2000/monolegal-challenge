import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import cron from 'node-cron';
import { createContainer, disconnectMongoDB, loadConfigFromEnv } from '@monolegal/infrastructure';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? '0 8 * * *';
const RUN_ON_START = process.env.RUN_ON_START === 'true';

async function runJob(container: Awaited<ReturnType<typeof createContainer>>): Promise<void> {
  const jobLogger = container.logger.child({ correlationId: randomUUID() });
  jobLogger.info('Worker job started');
  const result = await container.processInvoiceRemindersUseCase.execute();
  jobLogger.info('Worker job finished', {
    processed: result.processed,
    failed: result.failed,
  });
}

async function main(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('worker'));

  if (RUN_ON_START) {
    container.logger.info('RUN_ON_START enabled — executing job immediately');
    await runJob(container);
  }

  if (!cron.validate(CRON_SCHEDULE)) {
    container.logger.error('Invalid CRON_SCHEDULE', { schedule: CRON_SCHEDULE });
    process.exit(1);
  }

  cron.schedule(CRON_SCHEDULE, () => {
    runJob(container).catch((error) => {
      container.logger.error('Worker job failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  });

  container.logger.info('Worker scheduler started', { schedule: CRON_SCHEDULE });

  const shutdown = async (): Promise<void> => {
    container.logger.info('Shutting down worker');
    await disconnectMongoDB();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
