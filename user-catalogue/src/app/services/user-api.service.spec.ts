import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { User } from '../models/user.model';
import { apiUser } from '../testing/api-users';
import { UserApiService } from './user-api.service';

const BASE = 'https://api.test';

describe('UserApiService', () => {
  let api: UserApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    api = TestBed.inject(UserApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it('GETs the user list and maps it to the app shape', () => {
    let result: User[] | undefined;
    api.getUsers().subscribe((users) => (result = users));

    const req = http.expectOne(`${BASE}/users`);
    expect(req.request.method).toBe('GET');
    req.flush([apiUser(1)]);

    expect(result).toEqual([
      {
        id: 1,
        name: 'User 1',
        username: 'user1',
        email: 'user1@example.com',
        phone: '555-0100',
        website: 'user1.example.com',
        street: 'Main St, Apt 1',
        city: 'City 1',
        zipcode: '12345',
        company: 'Company 1',
      },
    ]);
  });

  it('GETs a single user by id', () => {
    let result: User | undefined;
    api.getUser(3).subscribe((user) => (result = user));
    http.expectOne(`${BASE}/users/3`).flush(apiUser(3));
    expect(result?.name).toBe('User 3');
  });

  it('retries once after a network error', () => {
    vi.useFakeTimers();
    let result: User[] | undefined;
    api.getUsers().subscribe((users) => (result = users));

    http.expectOne(`${BASE}/users`).error(new ProgressEvent('error'));
    vi.advanceTimersByTime(500);
    http.expectOne(`${BASE}/users`).flush([apiUser(1)]);

    expect(result?.length).toBe(1);
  });

  it('does not retry a 404', () => {
    let status: number | undefined;
    api.getUser(99).subscribe({ error: (err) => (status = err.status) });
    http.expectOne(`${BASE}/users/99`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });

  it('POSTs a new user', () => {
    let result: User | undefined;
    api
      .createUser({
        name: 'Ada',
        username: 'ada',
        email: 'ada@example.com',
        phone: '',
        city: 'London',
      })
      .subscribe((user) => (result = user));

    const req = http.expectOne(`${BASE}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.address.city).toBe('London');
    req.flush({ ...req.request.body, id: 11 });

    expect(result).toMatchObject({ id: 11, name: 'Ada', city: 'London' });
  });
});
