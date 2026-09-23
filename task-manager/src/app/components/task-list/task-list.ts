import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { TaskItem } from '../task-item/task-item';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private readonly taskService = inject(TaskService);

  protected readonly tasks = this.taskService.visibleTasks;
  protected readonly editingId = this.taskService.editingId;
  protected readonly filter = this.taskService.filter;

  protected onToggle(id: string): void {
    this.taskService.toggleStatus(id);
  }

  protected onEdit(id: string): void {
    this.taskService.startEditing(id);
  }

  protected onRemove(id: string): void {
    const task = this.tasks().find((t) => t.id === id);
    if (task && confirm(`Delete "${task.title}"?`)) {
      this.taskService.delete(id);
    }
  }
}
