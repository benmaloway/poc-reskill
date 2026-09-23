import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  template: `<p class="loading" role="status"><span class="spinner"></span>{{ label() }}</p>`,
  styles: `
    .loading {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0;
      padding: 1rem 0;
      color: var(--muted);
    }
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LoadingIndicator {
  readonly label = input('Loading…');
}
