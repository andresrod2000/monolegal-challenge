import { Router } from 'express';
import type { Container } from '@monolegal/infrastructure';

export function createInvoicesRouter(container: Container): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const invoices = await container.getInvoicesSummaryUseCase.execute();
      res.json({
        data: invoices.map((invoice) => ({
          ...invoice,
          dueDate: invoice.dueDate.toISOString(),
        })),
        meta: { total: invoices.length },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
