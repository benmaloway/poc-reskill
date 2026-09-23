import { Component } from '@angular/core';
import { TaskFilter } from './components/task-filter/task-filter';
import { TaskForm } from './components/task-form/task-form';
import { TaskList } from './components/task-list/task-list';

@Component({
  selector: 'app-root',
  imports: [TaskForm, TaskFilter, TaskList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
