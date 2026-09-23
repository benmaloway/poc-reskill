import { Injectable, computed, effect, signal } from '@angular/core';
import { Task, TaskFilter, TaskInput } from '../models/task.model';

const STORAGE_KEY = 'poc1.tasks';

/**
 * Single source of truth for tasks. Components read state through the
 * read-only signals and change it only through the methods below.
 * Every change is persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksState = signal<Task[]>(this.load());
  private readonly editingIdState = signal<string | null>(null);
  private readonly filterState = signal<TaskFilter>('all');

  readonly tasks = this.tasksState.asReadonly();
  readonly editingId = this.editingIdState.asReadonly();
  readonly filter = this.filterState.asReadonly();

  readonly editingTask = computed(() => {
    const id = this.editingIdState();
    return id ? (this.tasksState().find((t) => t.id === id) ?? null) : null;
  });

  readonly visibleTasks = computed(() => {
    const filter = this.filterState();
    const tasks = this.tasksState();
    return filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  });

  readonly counts = computed(() => {
    const tasks = this.tasksState();
    const done = tasks.filter((t) => t.status === 'done').length;
    return { all: tasks.length, todo: tasks.length - done, done };
  });

  constructor() {
    effect(() => this.save(this.tasksState()));
  }

  add(input: TaskInput): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'todo',
      createdAt: Date.now(),
    };
    this.tasksState.update((tasks) => [task, ...tasks]);
  }

  update(id: string, input: TaskInput): void {
    this.tasksState.update((tasks) =>
      tasks.map((t) =>
        t.id === id ? { ...t, title: input.title.trim(), description: input.description.trim() } : t,
      ),
    );
    this.editingIdState.set(null);
  }

  delete(id: string): void {
    this.tasksState.update((tasks) => tasks.filter((t) => t.id !== id));
    if (this.editingIdState() === id) {
      this.editingIdState.set(null);
    }
  }

  toggleStatus(id: string): void {
    this.tasksState.update((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t)),
    );
  }

  startEditing(id: string): void {
    this.editingIdState.set(id);
  }

  cancelEditing(): void {
    this.editingIdState.set(null);
  }

  setFilter(filter: TaskFilter): void {
    this.filterState.set(filter);
  }

  private load(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  private save(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  }
}
