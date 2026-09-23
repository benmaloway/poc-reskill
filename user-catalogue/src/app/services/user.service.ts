import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { describeHttpError } from '../core/http-error';
import { NewUser, User } from '../models/user.model';
import { UserApiService } from './user-api.service';

interface ListState {
  users: User[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

/**
 * State layer between the API and the components. Holds the user list,
 * the loading flag and the last error as signals; components read those
 * and call `load`, `refresh`, `getUser` and `create`.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(UserApiService);
  private readonly reload$ = new Subject<void>();

  private readonly state = signal<ListState>({
    users: [],
    loading: false,
    error: null,
    loaded: false,
  });
  /** Users added with the form. The demo API doesn't store them, so we keep them here. */
  private readonly localUsers = signal<User[]>([]);

  readonly users = computed(() => [...this.localUsers(), ...this.state().users]);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    // switchMap cancels a request still in flight when refresh is clicked again.
    this.reload$
      .pipe(
        tap(() => this.state.update((s) => ({ ...s, loading: true, error: null }))),
        switchMap(() =>
          this.api.getUsers().pipe(
            map((users) => ({ users, error: null })),
            catchError((err) => of({ users: null, error: describeHttpError(err) })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ users, error }) =>
        this.state.update((s) => ({
          // On failure, keep showing the last list we had.
          users: users ?? s.users,
          loading: false,
          error,
          loaded: s.loaded || users !== null,
        })),
      );
  }

  /** Fetches the list the first time only; later visits reuse it. */
  load(): void {
    if (!this.state().loaded && !this.state().loading) {
      this.reload$.next();
    }
  }

  /** Always fetches a fresh list. */
  refresh(): void {
    this.reload$.next();
  }

  /** Uses the cached user when there is one, otherwise asks the API. */
  getUser(id: number): Observable<User> {
    const cached = this.users().find((u) => u.id === id);
    return cached ? of(cached) : this.api.getUser(id);
  }

  create(input: NewUser): Observable<User> {
    return this.api.createUser(input).pipe(
      // JSONPlaceholder returns id 11 for every POST, so assign our own unique id.
      map((created) => ({ ...created, id: this.nextId(), local: true })),
      tap((user) => this.localUsers.update((users) => [user, ...users])),
    );
  }

  private nextId(): number {
    return Math.max(10, ...this.users().map((u) => u.id)) + 1;
  }
}
