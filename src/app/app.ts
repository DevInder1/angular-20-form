import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PerformanceService } from './services/performance.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly performanceService = inject(PerformanceService);
  protected title = 'Angular 21 - Generic Form Layout';
  
  constructor() {
    // Log performance metrics after app initialization
    effect(() => {
      setTimeout(() => this.performanceService.reportMetrics(), 3000);
    }, { allowSignalWrites: false });
  }
}
