import { Router } from 'express';
import type { GetInvoicesSummaryUseCase } from '@monolegal/application';
import { toInvoiceSummaryDtoList } from '../mappers/invoice.mapper.js';

export function createInvoicesRouter(getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const invoices = await getInvoicesSummaryUseCase.execute();
      res.json({
        data: toInvoiceSummaryDtoList(invoices),
        meta: { total: invoices.length },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
