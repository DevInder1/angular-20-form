import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { inject, Injectable } from '@angular/core';

/**
 * Custom preloading strategy that preloads routes after a delay
 * This improves initial load performance while ensuring quick navigation
 */
@Injectable({ providedIn: 'root' })
export class QuicklinkStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // Preload after 2 seconds to prioritize initial render
    return timer(2000).pipe(
      mergeMap(() => {
        console.log('Preloading: ' + route.path);
        return load();
      })
    );
  }
}
