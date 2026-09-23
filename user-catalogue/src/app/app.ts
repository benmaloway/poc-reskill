import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OutageSimulator } from './core/outage-simulator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly outage = inject(OutageSimulator);
}
