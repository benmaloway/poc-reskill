import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorMessage } from '../../components/error-message/error-message';
import { LoadingIndicator } from '../../components/loading-indicator/loading-indicator';
import { UserTable } from '../../components/user-table/user-table';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, UserTable, ErrorMessage, LoadingIndicator],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  protected readonly userService = inject(UserService);
  protected readonly search = signal('');

  protected readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const users = this.userService.users();
    if (!term) return users;
    return users.filter((u) =>
      [u.name, u.email, u.city].some((field) => field.toLowerCase().includes(term)),
    );
  });

  ngOnInit(): void {
    this.userService.load();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
