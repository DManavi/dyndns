import { NotFoundError, NotFoundErrorConstructorOptions } from 'error-lib';

export type DomainNotFoundErrorConstructorOptions =
  NotFoundErrorConstructorOptions & {};

export class DomainNotFoundError extends NotFoundError {
  constructor(message?: string, opts?: NotFoundErrorConstructorOptions) {
    message = message ?? 'DomainNotFoundError';

    super(message, {
      cause: opts?.cause,
      code: opts?.code ?? 'E_DOMAIN_NOT_FOUND',
    });

    Error.captureStackTrace(this, DomainNotFoundError);
    Object.setPrototypeOf(this, DomainNotFoundError);
  }
}
