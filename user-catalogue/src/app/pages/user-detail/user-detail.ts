import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessage } from '../../components/error-message/error-message';
import { LoadingIndicator } from '../../components/loading-indicator/loading-indicator';
import { describeHttpError } from '../../core/http-error';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

type DetailState =
  | { status: 'loading' }
  | { status: 'loaded'; user: User }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, ErrorMessage, LoadingIndicator],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail {
  private readonly userService = inject(UserService);

  /** Bound from the `:id` route parameter (withComponentInputBinding). */
  readonly id = input.required<string>();

  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal(
    combineLatest([toObservable(this.id), this.retry$]).pipe(
      switchMap(([id]) => {
        const userId = Number(id);
        if (!Number.isInteger(userId) || userId < 1) {
          return of<DetailState>({ status: 'not-found' });
        }
        return this.userService.getUser(userId).pipe(
          map((user): DetailState => ({ status: 'loaded', user })),
          catchError((err) =>
            of<DetailState>(
              err instanceof HttpErrorResponse && err.status === 404
                ? { status: 'not-found' }
                : { status: 'error', message: describeHttpError(err) },
            ),
          ),
          startWith<DetailState>({ status: 'loading' }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as DetailState },
  );

  protected readonly user = computed(() => {
    const s = this.state();
    return s.status === 'loaded' ? s.user : null;
  });

  protected readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : null;
  });

  protected retry(): void {
    this.retry$.next();
  }
}
