/** A user exactly as JSONPlaceholder returns it from GET /users. */
export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

/** The flattened shape the app works with. */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  zipcode: string;
  company: string;
  /** True for users created in this session: the demo API accepts POSTs but does not store them. */
  local?: boolean;
}

/** Fields collected by the "Add user" form. */
export interface NewUser {
  name: string;
  username: string;
  email: string;
  phone: string;
  city: string;
}
