import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { User } from '../models/user.model';
import { apiUser } from '../testing/api-users';
import { UserService } from './user.service';

const BASE = 'https://api.test';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sets loading while fetching, then exposes the users', () => {
    service.load();
    expect(service.loading()).toBe(true);

    http.expectOne(`${BASE}/users`).flush([apiUser(1), apiUser(2)]);

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.users().map((u) => u.id)).toEqual([1, 2]);
  });

  it('only fetches once with load(), but always with refresh()', () => {
    service.load();
    http.expectOne(`${BASE}/users`).flush([apiUser(1)]);
    service.load();
    http.expectNone(`${BASE}/users`);

    service.refresh();
    http.expectOne(`${BASE}/users`).flush([apiUser(1), apiUser(2)]);
    expect(service.users().length).toBe(2);
  });

  it('reports an error and keeps the last list when a refresh fails', () => {
    service.load();
    http.expectOne(`${BASE}/users`).flush([apiUser(1)]);

    service.refresh();
    http.expectOne(`${BASE}/users`).flush({}, { status: 404, statusText: 'Not Found' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toContain('not found');
    expect(service.users().length).toBe(1);
  });

  it('serves getUser from the cache when the user is already loaded', () => {
    service.load();
    http.expectOne(`${BASE}/users`).flush([apiUser(1)]);

    let result: User | undefined;
    service.getUser(1).subscribe((u) => (result = u));
    http.expectNone(`${BASE}/users/1`);
    expect(result?.name).toBe('User 1');
  });

  it('keeps created users with a unique id, even across refreshes', () => {
    service.load();
    http.expectOne(`${BASE}/users`).flush([apiUser(1), apiUser(10)]);

    const input = { name: 'Ada', username: 'ada', email: 'a@b.co', phone: '', city: '' };
    service.create(input).subscribe();
    http.expectOne({ method: 'POST', url: `${BASE}/users` }).flush({ ...apiUser(11), name: 'Ada' });
    service.create({ ...input, name: 'Bob' }).subscribe();
    http.expectOne({ method: 'POST', url: `${BASE}/users` }).flush({ ...apiUser(11), name: 'Bob' });

    expect(
      service
        .users()
        .slice(0, 2)
        .map((u) => [u.id, u.name, u.local]),
    ).toEqual([
      [12, 'Bob', true],
      [11, 'Ada', true],
    ]);

    service.refresh();
    http.expectOne(`${BASE}/users`).flush([apiUser(1), apiUser(10)]);
    expect(service.users().length).toBe(4);
  });
});
