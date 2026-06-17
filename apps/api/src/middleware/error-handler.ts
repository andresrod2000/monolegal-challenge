import type { NextFunction, Request, Response } from 'express';
import {
  ClientHasInvoicesError,
  ClientNotFoundError,
  ClientValidationError,
  DomainError,
  InvoiceNotFoundError,
  InvoiceTransitionError,
  InvoiceValidationError,
  type ILogger,
} from '@monolegal/domain';
import type { RequestWithContext } from './request-context.js';

function getStatusCode(error: Error): number {
  if (
    error instanceof ClientValidationError ||
    error instanceof InvoiceValidationError ||
    error instanceof InvoiceTransitionError ||
    error instanceof ClientHasInvoicesError
  ) {
    return 400;
  }
  if (error instanceof ClientNotFoundError || error instanceof InvoiceNotFoundError) {
    return 404;
  }
  if (error instanceof DomainError) {
    return 400;
  }
  return 500;
}

export function createErrorHandler(logger: ILogger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestLogger = (req as RequestWithContext).requestLogger ?? logger;
    const statusCode = getStatusCode(err);

    if (statusCode >= 500) {
      requestLogger.error('Unhandled request error', {
        message: err.message,
        path: req.path,
        method: req.method,
      });
    } else {
      requestLogger.warn('Request failed', {
        message: err.message,
        path: req.path,
        method: req.method,
        statusCode,
      });
    }

    if (res.headersSent) {
      return;
    }

    if (statusCode >= 500) {
      res.status(500).json({
        error: {
          message: 'Internal server error',
        },
      });
      return;
    }

    res.status(statusCode).json({
      error: {
        message: err.message,
      },
    });
  };
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: 'Not found',
    },
  });
}
