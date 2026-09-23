import { InjectionToken } from '@angular/core';

/** Base URL of the users API. Provided in app.config.ts; tests can override it. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://jsonplaceholder.typicode.com',
});

/** How long to wait for a response before giving up. */
export const REQUEST_TIMEOUT_MS = 10_000;
