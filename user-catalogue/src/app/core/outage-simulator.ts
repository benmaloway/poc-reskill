import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Demo helper: when enabled, every HTTP request fails as if the API were
 * unreachable, so the error handling can be seen without cutting the network.
 */
@Injectable({ providedIn: 'root' })
export class OutageSimulator {
  readonly enabled = signal(false);

  toggle(): void {
    this.enabled.update((on) => !on);
  }
}

export const outageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!inject(OutageSimulator).enabled()) {
    return next(req);
  }
  // Short delay so the loading state is visible before the error appears.
  return timer(400).pipe(
    mergeMap(() =>
      throwError(
        () => new HttpErrorResponse({ status: 0, statusText: 'Unknown Error', url: req.url }),
      ),
    ),
  );
};
