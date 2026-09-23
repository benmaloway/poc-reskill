export type TaskStatus = 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
}

/** Fields the user can provide when creating or editing a task. */
export type TaskInput = Pick<Task, 'title' | 'description'>;

export type TaskFilter = 'all' | TaskStatus;
