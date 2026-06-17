import { Router } from 'express';
import type { ProcessInvoiceRemindersUseCase } from '@monolegal/application';

export interface RemindersRouterDeps {
  processInvoiceRemindersUseCase: ProcessInvoiceRemindersUseCase;
}

export function createRemindersRouter(deps: RemindersRouterDeps): Router {
  const router = Router();

  router.post('/process', async (_req, res, next) => {
    try {
      const result = await deps.processInvoiceRemindersUseCase.execute();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/process/:invoiceId', async (req, res, next) => {
    try {
      const result = await deps.processInvoiceRemindersUseCase.executeForInvoiceId(
        req.params.invoiceId,
      );
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
