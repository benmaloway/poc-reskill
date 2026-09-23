import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task } from '../../models/task.model';

/** Presentational component: displays one task and emits the user's actions. */
@Component({
  selector: 'app-task-item',
  imports: [DatePipe],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly editing = input(false);

  readonly toggle = output<string>();
  readonly edit = output<string>();
  readonly remove = output<string>();
}
