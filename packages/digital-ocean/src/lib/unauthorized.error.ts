import {
  ApplicationError,
  ApplicationErrorConstructorOptions,
} from 'error-lib';

export type UnauthorizedErrorConstructorOptions =
  ApplicationErrorConstructorOptions & {};

export class UnauthorizedError extends ApplicationError {
  constructor(message?: string, opts?: UnauthorizedErrorConstructorOptions) {
    message = message ?? 'UnauthorizedError';

    super(message, {
      cause: opts?.cause,
      code: opts?.code ?? 'E_UNAUTHORIZED',
    });

    Error.captureStackTrace(this, UnauthorizedError);
    Object.setPrototypeOf(this, UnauthorizedError);
  }
}
