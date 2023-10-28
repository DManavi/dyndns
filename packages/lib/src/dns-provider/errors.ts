import {
  ApplicationError,
  ApplicationErrorConstructorOptions,
} from 'error-lib';

export class AuthenticationFailedError extends ApplicationError {
  constructor(message?: string, opts?: ApplicationErrorConstructorOptions) {
    super(message ?? 'Unauthorized', {
      cause: opts?.cause,
      code: opts?.code ?? 'E_UNAUTHORIZED',
    });

    Error.captureStackTrace(this, AuthenticationFailedError);
    Object.setPrototypeOf(this, AuthenticationFailedError.prototype);
  }
}
