import { Component, inject } from '@angular/core';
import { TaskFilter as Filter } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.html',
  styleUrl: './task-filter.css',
})
export class TaskFilter {
  private readonly taskService = inject(TaskService);

  protected readonly filter = this.taskService.filter;
  protected readonly counts = this.taskService.counts;
  protected readonly options: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To do' },
    { value: 'done', label: 'Done' },
  ];

  protected select(value: Filter): void {
    this.taskService.setFilter(value);
  }
}
