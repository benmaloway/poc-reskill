import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('adds a task with status todo and trimmed fields', () => {
    service.add({ title: '  Buy milk ', description: ' 2L ' });
    const [task] = service.tasks();
    expect(task.title).toBe('Buy milk');
    expect(task.description).toBe('2L');
    expect(task.status).toBe('todo');
  });

  it('edits a task and leaves edit mode', () => {
    service.add({ title: 'Old', description: '' });
    const id = service.tasks()[0].id;
    service.startEditing(id);
    expect(service.editingTask()?.id).toBe(id);

    service.update(id, { title: 'New', description: 'Details' });
    expect(service.tasks()[0]).toMatchObject({ title: 'New', description: 'Details' });
    expect(service.editingTask()).toBeNull();
  });

  it('toggles a task between todo and done', () => {
    service.add({ title: 'Task', description: '' });
    const id = service.tasks()[0].id;
    service.toggleStatus(id);
    expect(service.tasks()[0].status).toBe('done');
    service.toggleStatus(id);
    expect(service.tasks()[0].status).toBe('todo');
  });

  it('deletes a task', () => {
    service.add({ title: 'A', description: '' });
    service.add({ title: 'B', description: '' });
    service.delete(service.tasks()[0].id);
    expect(service.tasks().map((t) => t.title)).toEqual(['A']);
  });

  it('filters visible tasks and counts by status', () => {
    service.add({ title: 'A', description: '' });
    service.add({ title: 'B', description: '' });
    service.toggleStatus(service.tasks()[0].id);

    expect(service.counts()).toEqual({ all: 2, todo: 1, done: 1 });
    service.setFilter('done');
    expect(service.visibleTasks().map((t) => t.title)).toEqual(['B']);
    service.setFilter('todo');
    expect(service.visibleTasks().map((t) => t.title)).toEqual(['A']);
  });

  it('persists tasks to localStorage and reloads them', () => {
    service.add({ title: 'Persisted', description: '' });
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem('poc1.tasks')!)[0].title).toBe('Persisted');

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(TaskService);
    expect(reloaded.tasks()[0].title).toBe('Persisted');
  });
});
