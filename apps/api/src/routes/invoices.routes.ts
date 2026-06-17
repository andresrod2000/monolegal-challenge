import { Router } from 'express';
import type {
  CreateInvoiceUseCase,
  DeleteInvoiceUseCase,
  GetInvoiceByIdUseCase,
  GetInvoicesSummaryUseCase,
  UpdateInvoiceUseCase,
} from '@monolegal/application';
import {
  toInvoiceDetailDto,
  toInvoiceSummaryDtoList,
  type CreateInvoiceBody,
  type UpdateInvoiceBody,
} from '../mappers/invoice.mapper.js';

export interface InvoicesRouterDeps {
  getInvoicesSummaryUseCase: GetInvoicesSummaryUseCase;
  getInvoiceByIdUseCase: GetInvoiceByIdUseCase;
  createInvoiceUseCase: CreateInvoiceUseCase;
  updateInvoiceUseCase: UpdateInvoiceUseCase;
  deleteInvoiceUseCase: DeleteInvoiceUseCase;
}

export function createInvoicesRouter(deps: InvoicesRouterDeps): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const invoices = await deps.getInvoicesSummaryUseCase.execute();
      res.json({
        data: toInvoiceSummaryDtoList(invoices),
        meta: { total: invoices.length },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const invoice = await deps.getInvoiceByIdUseCase.execute(req.params.id);
      res.json({ data: toInvoiceDetailDto(invoice) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = req.body as CreateInvoiceBody;
      const invoice = await deps.createInvoiceUseCase.execute({
        clientId: body.clientId,
        concept: body.concept,
        amount: body.amount,
        dueDate: new Date(body.dueDate),
        status: body.status,
      });
      res.status(201).json({ data: toInvoiceDetailDto(invoice) });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const body = req.body as UpdateInvoiceBody;
      const invoice = await deps.updateInvoiceUseCase.execute(req.params.id, {
        concept: body.concept,
        amount: body.amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status,
      });
      res.json({ data: toInvoiceDetailDto(invoice) });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await deps.deleteInvoiceUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
