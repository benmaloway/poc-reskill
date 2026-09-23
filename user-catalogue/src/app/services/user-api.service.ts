import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, retry, timeout } from 'rxjs/operators';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../core/api.config';
import { isRetryable } from '../core/http-error';
import { ApiUser, NewUser, User } from '../models/user.model';

/**
 * API layer: the only place that knows about URLs and the API's data shape.
 * Every method returns a cold Observable of app-level `User` objects;
 * errors are passed through for the caller to handle.
 */
@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getUsers(): Observable<User[]> {
    return this.http.get<ApiUser[]>(`${this.baseUrl}/users`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      retryOnceIfTransient(),
      map((users) => users.map(toUser)),
    );
  }

  getUser(id: number): Observable<User> {
    return this.http
      .get<ApiUser>(`${this.baseUrl}/users/${id}`)
      .pipe(timeout(REQUEST_TIMEOUT_MS), retryOnceIfTransient(), map(toUser));
  }

  /** POSTs are not retried automatically: repeating one could create a duplicate. */
  createUser(input: NewUser): Observable<User> {
    const body = {
      name: input.name,
      username: input.username,
      email: input.email,
      phone: input.phone,
      website: '',
      address: { street: '', suite: '', city: input.city, zipcode: '', geo: { lat: '', lng: '' } },
      company: { name: '', catchPhrase: '', bs: '' },
    } satisfies Omit<ApiUser, 'id'>;
    return this.http
      .post<ApiUser>(`${this.baseUrl}/users`, body)
      .pipe(timeout(REQUEST_TIMEOUT_MS), map(toUser));
  }
}

function retryOnceIfTransient<T>() {
  return retry<T>({
    count: 1,
    delay: (error) => (isRetryable(error) ? timer(500) : throwError(() => error)),
  });
}

export function toUser(api: ApiUser): User {
  return {
    id: api.id,
    name: api.name,
    username: api.username,
    email: api.email,
    phone: api.phone,
    website: api.website,
    street: [api.address?.street, api.address?.suite].filter(Boolean).join(', '),
    city: api.address?.city ?? '',
    zipcode: api.address?.zipcode ?? '',
    company: api.company?.name ?? '',
  };
}
