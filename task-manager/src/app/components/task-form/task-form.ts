import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  private readonly taskService = inject(TaskService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly editingTask = this.taskService.editingTask;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    // Load the selected task into the form when editing starts, clear it when editing ends.
    effect(() => {
      const task = this.editingTask();
      this.form.reset(task ? { title: task.title, description: task.description } : undefined);
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.title.trim()) {
      this.form.controls.title.setErrors({ required: true });
      this.form.controls.title.markAsTouched();
      return;
    }

    const editing = this.editingTask();
    if (editing) {
      this.taskService.update(editing.id, value);
    } else {
      this.taskService.add(value);
      this.form.reset();
    }
  }

  protected cancel(): void {
    this.taskService.cancelEditing();
  }
}
