import { ApiUser } from '../models/user.model';

export function apiUser(id: number, overrides: Partial<ApiUser> = {}): ApiUser {
  return {
    id,
    name: `User ${id}`,
    username: `user${id}`,
    email: `user${id}@example.com`,
    phone: '555-0100',
    website: `user${id}.example.com`,
    address: {
      street: 'Main St',
      suite: 'Apt 1',
      city: `City ${id}`,
      zipcode: '12345',
      geo: { lat: '0', lng: '0' },
    },
    company: { name: `Company ${id}`, catchPhrase: '', bs: '' },
    ...overrides,
  };
}
