import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

/** Turns any error from an API call into a message that can be shown to the user. */
export function describeHttpError(error: unknown): string {
  if (error instanceof TimeoutError) {
    return 'The server took too long to respond. Please try again.';
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return "Can't reach the server. The API may be down, or you may be offline.";
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status >= 500) {
      return `The server ran into a problem (error ${error.status}). Please try again later.`;
    }
    return `The request failed (error ${error.status}).`;
  }
  return 'Something went wrong. Please try again.';
}

/** Only network failures, timeouts and server errors are worth retrying; a 404 won't change. */
export function isRetryable(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}
