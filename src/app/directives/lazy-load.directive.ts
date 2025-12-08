import { 
  Directive, 
  ElementRef, 
  inject, 
  input, 
  output,
  PLATFORM_ID,
  afterNextRender,
  OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Lazy load directive using Intersection Observer
 * Emits when element enters viewport
 * 
 * Usage:
 * <div appLazyLoad (visible)="loadData()">
 *   Content to lazy load
 * </div>
 */
@Directive({
  selector: '[appLazyLoad]',
})
export class LazyLoadDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  
  // Configuration
  threshold = input(0.1); // 10% visible
  rootMargin = input('50px'); // Start loading 50px before visible
  
  // Events
  visible = output<void>();
  
  private observer?: IntersectionObserver;
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.setupObserver();
      });
    }
  }
  
  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.visible.emit();
            this.observer?.disconnect(); // Stop observing after first intersection
          }
        });
      },
      {
        threshold: this.threshold(),
        rootMargin: this.rootMargin()
      }
    );
    
    this.observer.observe(this.el.nativeElement);
  }
  
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
