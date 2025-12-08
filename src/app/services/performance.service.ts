import { Injectable, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Performance monitoring service for tracking Core Web Vitals
 * Only runs in browser environment
 */
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly platformId = inject(PLATFORM_ID);
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.initPerformanceMonitoring();
      });
    }
  }
  
  private initPerformanceMonitoring(): void {
    // Mark app as interactive
    performance.mark('app-interactive');
    
    // Measure bootstrap time
    try {
      performance.measure('bootstrap', 'navigationStart', 'app-interactive');
      const measure = performance.getEntriesByName('bootstrap')[0];
      console.log(`🚀 Bootstrap: ${Math.round(measure.duration)}ms`);
    } catch {
      // navigationStart might not be available in all browsers
    }
    
    // Observe Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // Observe First Input Delay (FID) / Interaction to Next Paint (INP)
    this.observeINP();
    
    // Observe Cumulative Layout Shift (CLS)
    this.observeCLS();
  }
  
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        console.log(`📊 LCP: ${Math.round(lastEntry.renderTime || lastEntry.loadTime)}ms`);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      console.warn('LCP observation not supported');
    }
  }
  
  private observeINP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const inp = (entry as PerformanceEntry & { duration?: number }).duration;
          if (inp) {
            console.log(`⚡ INP: ${Math.round(inp)}ms`);
          }
        }
      });
      
      observer.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
    } catch {
      console.warn('INP observation not supported');
    }
  }
  
  private observeCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            clsValue += clsEntry.value;
          }
        }
        console.log(`📐 CLS: ${clsValue.toFixed(4)}`);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      console.warn('CLS observation not supported');
    }
  }
  
  /**
   * Measure and log execution time of a function
   */
  measureTask<T>(taskName: string, fn: () => T): T {
    const startMark = `${taskName}-start`;
    const endMark = `${taskName}-end`;
    
    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    
    performance.measure(taskName, startMark, endMark);
    const measure = performance.getEntriesByName(taskName)[0];
    console.log(`⏱️ ${taskName}: ${Math.round(measure.duration)}ms`);
    
    // Clean up marks and measures
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(taskName);
    
    return result;
  }
  
  /**
   * Measure async task execution time
   */
  async measureAsyncTask<T>(taskName: string, fn: () => Promise<T>): Promise<T> {
    const startMark = `${taskName}-start`;
    const endMark = `${taskName}-end`;
    
    performance.mark(startMark);
    const result = await fn();
    performance.mark(endMark);
    
    performance.measure(taskName, startMark, endMark);
    const measure = performance.getEntriesByName(taskName)[0];
    console.log(`⏱️ ${taskName}: ${Math.round(measure.duration)}ms`);
    
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(taskName);
    
    return result;
  }
  
  /**
   * Report current performance metrics
   */
  reportMetrics(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      console.group('📊 Performance Metrics');
      console.log(`DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
      console.log(`TCP Connection: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`);
      console.log(`Request Time: ${Math.round(navigation.responseStart - navigation.requestStart)}ms`);
      console.log(`Response Time: ${Math.round(navigation.responseEnd - navigation.responseStart)}ms`);
      console.log(`DOM Processing: ${Math.round(navigation.domComplete - navigation.domInteractive)}ms`);
      console.log(`Load Complete: ${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`);
      console.groupEnd();
    }
  }
}
