import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { describeHttpError, isRetryable } from './http-error';

describe('describeHttpError', () => {
  it('explains network failures', () => {
    expect(describeHttpError(new HttpErrorResponse({ status: 0 }))).toContain("Can't reach");
  });

  it('explains 404 and 5xx errors', () => {
    expect(describeHttpError(new HttpErrorResponse({ status: 404 }))).toContain('not found');
    expect(describeHttpError(new HttpErrorResponse({ status: 503 }))).toContain('error 503');
  });

  it('explains timeouts and unknown errors', () => {
    expect(describeHttpError(new TimeoutError())).toContain('too long');
    expect(describeHttpError(new Error('boom'))).toContain('Something went wrong');
  });
});

describe('isRetryable', () => {
  it('retries network, timeout and server errors but not 4xx', () => {
    expect(isRetryable(new HttpErrorResponse({ status: 0 }))).toBe(true);
    expect(isRetryable(new HttpErrorResponse({ status: 500 }))).toBe(true);
    expect(isRetryable(new TimeoutError())).toBe(true);
    expect(isRetryable(new HttpErrorResponse({ status: 404 }))).toBe(false);
  });
});
