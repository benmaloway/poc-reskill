import { Component, input, output } from '@angular/core';

/** Presentational component: shows an error and an optional "Try again" button. */
@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.html',
  styleUrl: './error-message.css',
})
export class ErrorMessage {
  readonly message = input.required<string>();
  readonly retryable = input(true);

  readonly retry = output<void>();
}
