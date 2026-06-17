import { Router } from 'express';
import type { ProcessOverdueInvoicesUseCase } from '@monolegal/application';

export interface OverdueRouterDeps {
  processOverdueInvoicesUseCase: ProcessOverdueInvoicesUseCase;
}

export function createOverdueRouter(deps: OverdueRouterDeps): Router {
  const router = Router();

  router.post('/process', async (_req, res, next) => {
    try {
      const result = await deps.processOverdueInvoicesUseCase.execute();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
