import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/api.config';
import { OutageSimulator, outageInterceptor } from './core/outage-simulator';
import { apiUser } from './testing/api-users';

const BASE = 'https://api.test';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([outageInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it('loads and lists users with name, email and city', async () => {
    const harness = await RouterTestingHarness.create('/');
    const el = harness.routeNativeElement!;
    expect(el.textContent).toContain('Loading users');

    http.expectOne(`${BASE}/users`).flush([apiUser(1), apiUser(2)]);
    harness.detectChanges();

    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('User 1');
    expect(rows[0].textContent).toContain('user1@example.com');
    expect(rows[0].textContent).toContain('City 1');
  });

  it('shows an error with a retry button when the API is down', async () => {
    vi.useFakeTimers();
    TestBed.inject(OutageSimulator).enabled.set(true);
    const harness = await RouterTestingHarness.create('/');

    // First attempt, then one automatic retry, each failing after the simulated delay.
    await vi.advanceTimersByTimeAsync(400 + 500 + 400);
    harness.detectChanges();

    const el = harness.routeNativeElement!;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain("Can't reach the server");

    TestBed.inject(OutageSimulator).enabled.set(false);
    el.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    http.expectOne(`${BASE}/users`).flush([apiUser(1)]);
    harness.detectChanges();

    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('shows the detail page for a user', async () => {
    const harness = await RouterTestingHarness.create('/users/5');
    http.expectOne(`${BASE}/users/5`).flush(apiUser(5));
    harness.detectChanges();

    const el = harness.routeNativeElement!;
    expect(el.querySelector('h2')?.textContent).toContain('User 5');
    expect(el.textContent).toContain('Company 5');
  });

  it('shows "does not exist" for an unknown user', async () => {
    const harness = await RouterTestingHarness.create('/users/999');
    http.expectOne(`${BASE}/users/999`).flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('User #999 does not exist');
  });
});
