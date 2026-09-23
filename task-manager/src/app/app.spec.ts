import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render the title and empty state', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Task Manager');
    expect(compiled.querySelector('.empty')?.textContent).toContain('No tasks yet');
  });

  it('adds a task through the form and shows it in the list', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const title = el.querySelector<HTMLInputElement>('#title')!;
    title.value = 'Write report';
    title.dispatchEvent(new Event('input'));
    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(el.querySelectorAll('app-task-item').length).toBe(1);
    expect(el.querySelector('.title')?.textContent).toContain('Write report');
  });
});
