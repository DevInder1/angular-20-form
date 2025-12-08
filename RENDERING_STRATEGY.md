# Angular 20+ Rendering Strategy Guide

## Table of Contents

1. [Overview](#overview)
2. [Zoneless Change Detection](#zoneless-change-detection)
3. [OnPush Change Detection](#onpush-change-detection)
4. [Signal-Based Reactivity](#signal-based-reactivity)
5. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
6. [Hydration Strategy](#hydration-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)

---

## Overview

Angular 20+ introduces **zoneless change detection** as the recommended rendering strategy, moving away from Zone.js dependency. This guide covers modern rendering approaches that maximize performance and developer experience.

### Key Concepts

- **Zoneless**: No Zone.js overhead, signals drive reactivity
- **OnPush**: Component only checks when inputs change or events fire
- **Signals**: Fine-grained reactivity system
- **SSR**: Server-side rendering for faster initial load
- **Hydration**: Reusing server-rendered DOM on client

---

## Zoneless Change Detection

### What is Zoneless?

Zoneless change detection removes the Zone.js library that monkey-patches browser APIs. Instead, Angular uses **signals** to track state changes.

### Benefits

| Aspect               | With Zone.js               | Zoneless                            |
| -------------------- | -------------------------- | ----------------------------------- |
| **Bundle Size**      | +40 KB                     | 0 KB (40 KB saved)                  |
| **Change Detection** | Global (entire app)        | Targeted (only affected components) |
| **Performance**      | Slower (checks everything) | 30-40% faster                       |
| **Predictability**   | Low (hard to debug)        | High (explicit triggers)            |
| **Third-party libs** | Auto-detected              | May need manual `.update()`         |

### Migration from Zone.js

**Step 1: Update app.config.ts**

```typescript
import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ← Replaces provideZoneChangeDetection()
    provideRouter(routes),
  ],
};
```

**Step 2: Remove Zone.js from polyfills**

```typescript
// main.ts - Remove this import if present
// import 'zone.js'; // ← DELETE THIS LINE

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig);
```

**Step 3: Convert to Signals**

```typescript
// ❌ OLD (Zone.js dependent)
export class UserComponent {
  users: User[] = [];

  loadUsers() {
    this.http.get<User[]>('/api/users').subscribe((users) => {
      this.users = users; // Zone.js detects this change
    });
  }
}

// ✅ NEW (Zoneless compatible)
export class UserComponent {
  protected readonly users = signal<User[]>([]);
  private readonly http = inject(HttpClient);

  loadUsers() {
    this.http.get<User[]>('/api/users').subscribe((users) => {
      this.users.set(users); // Explicit signal update
    });
  }
}
```

### Handling Third-Party Libraries

Some libraries trigger changes outside Angular's awareness in zoneless mode.

**Problem Example:**

```typescript
// Chart.js updates DOM directly
export class ChartComponent {
  protected readonly chartData = signal<number[]>([]);

  ngAfterViewInit() {
    // Chart.js doesn't trigger change detection in zoneless
    this.chart = new Chart(this.canvas, {
      data: this.chartData(),
    });
  }
}
```

**Solution: Manual Trigger**

```typescript
import { ChangeDetectorRef, inject } from '@angular/core';

export class ChartComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  updateChart(newData: number[]) {
    this.chartData.set(newData);
    this.chart.update(); // External library
    this.cdr.markForCheck(); // ← Manually mark for check
  }
}
```

---

## OnPush Change Detection

### What is OnPush?

OnPush tells Angular to **only check a component** when:

1. Input signals change
2. Events fire (click, submit, etc.)
3. Observables emit (async pipe)
4. Manually triggered (`markForCheck()`)

### Why OnPush?

```typescript
// Default change detection (checks every component)
┌─────────────────┐
│   AppComponent  │ ← Checks on EVERY event
├─────────────────┤
│ HeaderComponent │ ← Checks unnecessarily
│ UserList        │ ← Checks even if data unchanged
│   UserCard (×50)│ ← All 50 cards checked!
│ FooterComponent │ ← Checks unnecessarily
└─────────────────┘

// OnPush change detection (targeted)
┌─────────────────┐
│   AppComponent  │ ← Checks only if input changed
├─────────────────┤
│ HeaderComponent │ ← Skipped (no input change)
│ UserList        │ ← Only if users() signal changed
│   UserCard (×1) │ ← Only the ONE card that changed
│ FooterComponent │ ← Skipped (no input change)
└─────────────────┘
```

**Result**: 98% fewer checks in typical app!

### Implementation

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ← Always add this
})
export class UserListComponent {
  // All state as signals
  protected readonly users = signal<User[]>([]);
  protected readonly filter = signal('');

  // Derived state with computed
  protected readonly filteredUsers = computed(() => {
    const searchTerm = this.filter().toLowerCase();
    return this.users().filter((u) =>
      u.name.toLowerCase().includes(searchTerm)
    );
  });

  // Input signal (from parent)
  protected readonly sortOrder = input<'asc' | 'desc'>('asc');

  // Computed that depends on input
  protected readonly sortedUsers = computed(() => {
    const users = this.filteredUsers();
    const order = this.sortOrder();
    return users.sort((a, b) =>
      order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  });
}
```

### Common Mistakes

**❌ WRONG: Mutating objects**

```typescript
addUser(user: User) {
  this.users().push(user); // ❌ Mutation not detected!
}
```

**✅ CORRECT: Immutable updates**

```typescript
addUser(user: User) {
  this.users.update(users => [...users, user]); // ✅ New array reference
}
```

**❌ WRONG: Using getters**

```typescript
get filteredUsers() {
  return this.users.filter(u => u.active); // ❌ Runs on EVERY check
}
```

**✅ CORRECT: Using computed**

```typescript
protected readonly filteredUsers = computed(() =>
  this.users().filter(u => u.active) // ✅ Only recalculates when users() changes
);
```

---

## Signal-Based Reactivity

### Signal Types

#### 1. **Writable Signal** - Mutable state

```typescript
export class CounterComponent {
  protected readonly count = signal(0); // Initial value: 0

  increment() {
    this.count.update((n) => n + 1); // count.set(count() + 1) also works
  }

  reset() {
    this.count.set(0);
  }
}
```

#### 2. **Computed Signal** - Derived state (readonly)

```typescript
export class ShoppingCartComponent {
  protected readonly items = signal<CartItem[]>([]);

  // Automatically updates when items() changes
  protected readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  protected readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  protected readonly isEmpty = computed(() => this.items().length === 0);
}
```

#### 3. **Input Signal** - Component input (readonly from child)

```typescript
export class UserCardComponent {
  // Required input
  protected readonly user = input.required<User>();

  // Optional input with default
  protected readonly showEmail = input(false);

  // Transform input
  protected readonly userId = input.required<string, number>({
    transform: (value: number) => value.toString(),
  });

  // Computed based on input
  protected readonly displayName = computed(() => {
    const user = this.user();
    return `${user.firstName} ${user.lastName}`;
  });
}
```

```html
<!-- Parent template -->
<app-user-card [user]="currentUser()" [showEmail]="true" [userId]="123" />
```

#### 4. **Output Signal** - Component events

```typescript
export class FormComponent {
  // Output events
  protected readonly save = output<FormData>();
  protected readonly cancel = output<void>();

  onSubmit(data: FormData) {
    this.save.emit(data); // Emit to parent
  }

  onCancel() {
    this.cancel.emit(); // No payload
  }
}
```

```html
<!-- Parent template -->
<app-form (save)="handleSave($event)" (cancel)="handleCancel()" />
```

### Signal Effects

**Effect**: Runs side effects when signals change

```typescript
import { effect } from '@angular/core';

export class LoggingComponent {
  protected readonly userId = signal('user-123');
  protected readonly lastActive = signal(new Date());

  constructor() {
    // Logs whenever userId OR lastActive changes
    effect(() => {
      console.log(`User ${this.userId()} active at ${this.lastActive()}`);
    });

    // Cleanup on destroy
    effect((onCleanup) => {
      const subscription = this.stream$.subscribe();

      onCleanup(() => {
        subscription.unsubscribe(); // Runs when effect re-runs or component destroys
      });
    });
  }
}
```

**⚠️ Warning**: Use effects sparingly! Prefer `computed()` for derived state.

```typescript
// ❌ BAD: Using effect for derived state
effect(() => {
  this.fullName = `${this.firstName()} ${this.lastName()}`; // Anti-pattern!
});

// ✅ GOOD: Using computed for derived state
protected readonly fullName = computed(() =>
  `${this.firstName()} ${this.lastName()}`
);
```

### Async Data with Signals

**Pattern 1: Loading State**

```typescript
export class UserListComponent {
  private readonly http = inject(HttpClient);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<User[]>('/api/users').subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

```html
<div class="user-list">
  @if (loading()) {
  <app-spinner />
  } @if (error()) {
  <div role="alert" class="error">{{ error() }}</div>
  } @if (!loading() && !error()) { @for (user of users(); track user.id) {
  <app-user-card [user]="user" />
  } }
</div>
```

**Pattern 2: Resource Signal (Angular 19+)**

```typescript
import { resource } from '@angular/core';

export class UserDetailComponent {
  protected readonly userId = input.required<string>();

  // Automatically refetches when userId() changes
  protected readonly user = resource({
    request: () => ({ id: this.userId() }),
    loader: ({ request }) => this.http.get<User>(`/api/users/${request.id}`),
  });
}
```

```html
@if (user.isLoading()) {
<app-spinner />
} @if (user.error()) {
<div role="alert">{{ user.error() }}</div>
} @if (user.value(); as user) {
<h1>{{ user.name }}</h1>
<p>{{ user.email }}</p>
}
```

---

## Server-Side Rendering (SSR)

### Why SSR?

| Metric                  | CSR (Client-Only)                | SSR                     |
| ----------------------- | -------------------------------- | ----------------------- |
| **FCP**                 | 3-5s (after JS loads)            | 0.5-1s (HTML available) |
| **SEO**                 | Poor (crawlers wait for JS)      | Excellent (HTML ready)  |
| **Initial Load**        | Blank screen → Spinner → Content | Content immediately     |
| **Time to Interactive** | 4-6s                             | 2-3s                    |

### Enable SSR

```bash
# Add SSR to existing Angular app
ng add @angular/ssr
```

This creates:

- `server.ts` - Express server
- `src/main.server.ts` - Server bootstrap
- `tsconfig.server.json` - Server TypeScript config

**app.config.server.ts**

```typescript
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

export const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### SSR-Compatible Code

**❌ WRONG: Browser-only APIs**

```typescript
export class MapComponent {
  ngOnInit() {
    // ❌ Crashes on server (window not defined)
    const width = window.innerWidth;
    localStorage.setItem('key', 'value');
    document.querySelector('.map');
  }
}
```

**✅ CORRECT: Platform checks**

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class MapComponent {
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Safe - only runs in browser
      const width = window.innerWidth;
      localStorage.setItem('key', 'value');
    }
  }
}
```

**Alternative: afterNextRender (Angular 18+)**

```typescript
import { afterNextRender } from '@angular/core';

export class MapComponent {
  constructor() {
    afterNextRender(() => {
      // ✅ Only runs in browser, after render
      const map = new google.maps.Map(this.el.nativeElement);
    });
  }
}
```

### Transfer State (Avoid Duplicate API Calls)

**Problem**: API called on server, then again on client

```typescript
// Server: Calls /api/users
// Client: Calls /api/users AGAIN (duplicate!)
this.http.get('/api/users').subscribe((users) => this.users.set(users));
```

**Solution: TransferState**

```typescript
import { TransferState, makeStateKey } from '@angular/core';

const USERS_KEY = makeStateKey<User[]>('users');

export class UserListComponent {
  private readonly transferState = inject(TransferState);
  private readonly http = inject(HttpClient);

  ngOnInit() {
    // Check if data already transferred from server
    const cachedUsers = this.transferState.get(USERS_KEY, null);

    if (cachedUsers) {
      this.users.set(cachedUsers); // Use cached data
    } else {
      // Fetch from API
      this.http.get<User[]>('/api/users').subscribe((users) => {
        this.users.set(users);
        this.transferState.set(USERS_KEY, users); // Cache for client
      });
    }
  }
}
```

**How it works:**

1. Server renders component, fetches `/api/users`, caches in TransferState
2. HTML includes: `<script>window.__TRANSFER_STATE__={users:[...]}</script>`
3. Client hydrates, reads from TransferState, skips API call

---

## Hydration Strategy

### What is Hydration?

Hydration **reuses** the server-rendered HTML instead of destroying and recreating it.

**Without Hydration (Old):**

```
Server renders → Browser receives HTML → Angular destroys HTML → Recreates DOM
                                          ↑
                                      WASTE!
```

**With Hydration (Angular 16+):**

```
Server renders → Browser receives HTML → Angular attaches event listeners
                                          ↑
                                      REUSE! (faster)
```

### Enable Hydration

```typescript
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(), // ← Enable hydration
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
```

### Hydration-Friendly Components

**❌ WRONG: Direct DOM manipulation**

```typescript
export class TooltipComponent {
  ngAfterViewInit() {
    // ❌ Breaks hydration (DOM doesn't match server)
    this.el.nativeElement.innerHTML = '<span>Tooltip</span>';
  }
}
```

**✅ CORRECT: Use templates**

```typescript
export class TooltipComponent {
  protected readonly isVisible = signal(false);
}
```

```html
<!-- ✅ Angular manages DOM, hydration works -->
@if (isVisible()) {
<span class="tooltip">Tooltip</span>
}
```

### Skip Hydration for Specific Components

Some components (maps, charts, third-party widgets) don't benefit from hydration.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-google-map',
  template: '<div #map></div>',
  hydrate: false, // ← Skip hydration for this component
})
export class GoogleMapComponent {}
```

---

## Performance Optimization

### 1. Lazy Loading with Signals

```typescript
export class DashboardComponent {
  protected readonly showAnalytics = signal(false);

  // Component loaded only when showAnalytics() becomes true
  protected readonly AnalyticsComponent = signal<any>(null);

  async toggleAnalytics() {
    if (!this.AnalyticsComponent()) {
      // Lazy load component
      const { AnalyticsComponent } = await import(
        './analytics/analytics.component'
      );
      this.AnalyticsComponent.set(AnalyticsComponent);
    }

    this.showAnalytics.update((v) => !v);
  }
}
```

```html
@if (showAnalytics() && AnalyticsComponent()) {
<ng-container *ngComponentOutlet="AnalyticsComponent()" />
}
```

### 2. Virtual Scrolling

For large lists (1000+ items), render only visible items.

```typescript
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-user-list',
  imports: [CdkVirtualScrollViewport],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: [
    `
      .viewport {
        height: 500px; /* Fixed height required */
      }
    `,
  ],
})
export class UserListComponent {
  protected readonly users = signal<User[]>([]); // 10,000 users
}
```

**Before**: Renders 10,000 DOM nodes (slow!)  
**After**: Renders ~20 visible nodes (fast!)

### 3. trackBy for @for

```typescript
// ❌ WRONG: No trackBy (recreates all DOM on change)
@for (user of users(); track $index) {
  <app-user-card [user]="user" />
}

// ✅ CORRECT: trackBy with unique ID (only changed items recreated)
@for (user of users(); track user.id) {
  <app-user-card [user]="user" />
}
```

### 4. Memoization

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExpensiveCalculationService {
  private readonly cache = new Map<string, number>();

  protected readonly input = signal(0);

  // Memoized computed - only recalculates when input changes
  protected readonly result = computed(() => {
    const key = this.input().toString();

    if (this.cache.has(key)) {
      return this.cache.get(key)!; // Return cached result
    }

    const result = this.expensiveCalculation(this.input());
    this.cache.set(key, result);
    return result;
  });

  private expensiveCalculation(n: number): number {
    // Simulate expensive operation
    let sum = 0;
    for (let i = 0; i < 1_000_000; i++) {
      sum += Math.sqrt(i * n);
    }
    return sum;
  }
}
```

---

## Best Practices

### ✅ DO

1. **Always use OnPush**

```typescript
changeDetection: ChangeDetectionStrategy.OnPush; // Every component!
```

2. **Use signals for ALL state**

```typescript
protected readonly users = signal<User[]>([]); // Not: users: User[] = []
```

3. **Use computed for derived state**

```typescript
protected readonly total = computed(() => this.items().reduce(...)); // Not: get total()
```

4. **Use input() instead of @Input()**

```typescript
protected readonly user = input.required<User>(); // Not: @Input() user!: User
```

5. **Use output() instead of @Output()**

```typescript
protected readonly save = output<Data>(); // Not: @Output() save = new EventEmitter()
```

6. **Immutable updates**

```typescript
this.users.update((users) => [...users, newUser]); // Not: this.users().push(newUser)
```

7. **Use trackBy in @for**

```typescript
@for (item of items(); track item.id) // Not: track $index
```

8. **Check platform for browser APIs**

```typescript
if (isPlatformBrowser(this.platformId)) {
  window.scrollTo(0, 0);
}
```

9. **Use TransferState for SSR**

```typescript
const data = this.transferState.get(KEY, null) ?? this.fetch();
```

10. **Enable hydration**

```typescript
provideClientHydration(); // In app.config.ts
```

### ❌ DON'T

1. **Don't use Zone.js**

```typescript
provideZoneChangeDetection(); // ❌ Use provideZonelessChangeDetection()
```

2. **Don't mutate signals**

```typescript
this.users().push(newUser); // ❌ Use .update()
```

3. **Don't use getters for derived state**

```typescript
get total() { return this.items.reduce(...); } // ❌ Use computed()
```

4. **Don't overuse effects**

```typescript
effect(() => {
  this.derived = this.base() * 2;
}); // ❌ Use computed()
```

5. **Don't access browser APIs without checks**

```typescript
window.localStorage; // ❌ Crashes on server
```

6. **Don't manipulate DOM directly**

```typescript
this.el.nativeElement.innerHTML = '...'; // ❌ Breaks hydration
```

7. **Don't skip trackBy**

```typescript
@for (item of items(); track $index) // ❌ Use unique ID
```

8. **Don't use Default change detection**

```typescript
// ❌ Missing changeDetection: OnPush
```

9. **Don't call APIs on both server and client**

```typescript
// ❌ Use TransferState to avoid duplicate calls
```

10. **Don't block the main thread**

```typescript
// ❌ Use Web Workers for heavy computation
```

---

## Performance Checklist

- [ ] All components use `ChangeDetectionStrategy.OnPush`
- [ ] All state managed with signals
- [ ] Derived state uses `computed()`, not getters
- [ ] All `@for` loops have `track` with unique ID
- [ ] Virtual scrolling for lists > 100 items
- [ ] Lazy loading for heavy features
- [ ] SSR enabled for public-facing pages
- [ ] Hydration enabled
- [ ] TransferState prevents duplicate API calls
- [ ] Browser APIs guarded with `isPlatformBrowser`
- [ ] No direct DOM manipulation
- [ ] Effects used sparingly (prefer `computed()`)
- [ ] Zoneless change detection enabled
- [ ] Input/output signals instead of decorators

---

## Debugging

### View Change Detection in DevTools

```typescript
import { enableProdMode } from '@angular/core';

// In development, Angular DevTools shows:
// - Which components were checked
// - Why they were checked
// - Signal dependencies

// Angular 20+ DevTools Timeline shows:
// 1. Signal updates (red)
// 2. Computed recalculations (blue)
// 3. Component checks (green)
```

### Log Signal Changes

```typescript
effect(
  () => {
    console.log('Users changed:', this.users());
  },
  { allowSignalWrites: true }
);
```

### Measure Performance

```typescript
import { afterNextRender } from '@angular/core';

afterNextRender(() => {
  performance.mark('app-interactive');
  performance.measure('bootstrap', 'navigationStart', 'app-interactive');

  const measure = performance.getEntriesByName('bootstrap')[0];
  console.log(`Bootstrap took ${measure.duration}ms`);
});
```

---

## Summary

### Rendering Strategy Stack (Angular 20+)

```
┌─────────────────────────────────────┐
│  Zoneless Change Detection          │ ← No Zone.js overhead
├─────────────────────────────────────┤
│  OnPush Strategy (All Components)   │ ← Minimal checks
├─────────────────────────────────────┤
│  Signal-Based State                 │ ← Fine-grained reactivity
├─────────────────────────────────────┤
│  Server-Side Rendering (SSR)        │ ← Faster initial load
├─────────────────────────────────────┤
│  Hydration                          │ ← Reuse server HTML
├─────────────────────────────────────┤
│  Lazy Loading + Code Splitting      │ ← Smaller bundles
└─────────────────────────────────────┘

Result: 70% faster rendering, 40% smaller bundles
```

### Key Takeaways

1. **Zoneless** is the future - adopt it now
2. **OnPush** + **Signals** = Predictable performance
3. **SSR** + **Hydration** = Sub-2s FCP
4. **Computed** > Getters > Effects
5. **Immutable** updates prevent bugs
6. **Platform checks** for universal rendering

---

## Resources

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Zoneless Angular](https://angular.dev/guide/experimental/zoneless)
- [SSR Documentation](https://angular.dev/guide/ssr)
- [Hydration Guide](https://angular.dev/guide/hydration)
- [Performance Best Practices](https://web.dev/angular)

---

**Created for Angular 20+ | Last Updated: December 2025**
