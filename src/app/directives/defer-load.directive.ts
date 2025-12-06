import { 
  Directive, 
  TemplateRef, 
  ViewContainerRef, 
  inject,
  input,
  PLATFORM_ID,
  afterNextRender
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Defer loading directive - delays rendering until idle time
 * Useful for below-the-fold content
 * 
 * Usage:
 * <ng-container *appDeferLoad="500">
 *   <!-- Heavy component rendered after 500ms idle -->
 *   <app-heavy-component />
 * </ng-container>
 */
@Directive({
  selector: '[appDeferLoad]'
})
export class DeferLoadDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly platformId = inject(PLATFORM_ID);
  
  // Delay in milliseconds (default: render on next idle)
  appDeferLoad = input<number>(0);
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.scheduleRender();
      });
    } else {
      // On server, render immediately
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
  
  private scheduleRender(): void {
    const delay = this.appDeferLoad();
    
    if ('requestIdleCallback' in window) {
      // Use requestIdleCallback if available
      window.requestIdleCallback(
        () => this.render(),
        { timeout: delay || 2000 }
      );
    } else {
      // Fallback to setTimeout
      setTimeout(() => this.render(), delay);
    }
  }
  
  private render(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
