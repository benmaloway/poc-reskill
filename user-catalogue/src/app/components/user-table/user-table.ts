import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.model';

/** Presentational component: renders a list of users as a table. */
@Component({
  selector: 'app-user-table',
  imports: [RouterLink],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
})
export class UserTable {
  readonly users = input.required<User[]>();
}
