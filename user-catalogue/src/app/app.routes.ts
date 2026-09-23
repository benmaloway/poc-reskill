import { Routes } from '@angular/router';
import { UserDetail } from './pages/user-detail/user-detail';
import { UserForm } from './pages/user-form/user-form';
import { UserList } from './pages/user-list/user-list';

export const routes: Routes = [
  { path: '', component: UserList, title: 'Users · User Catalogue' },
  { path: 'users/new', component: UserForm, title: 'Add user · User Catalogue' },
  { path: 'users/:id', component: UserDetail, title: 'User details · User Catalogue' },
  { path: '**', redirectTo: '' },
];
