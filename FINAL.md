# Angular 21 Production-Ready Application Guide

## 1. Project Setup

### Initial Setup

```bash
# Create workspace with Nx
npx create-nx-workspace@latest myapp --preset=angular-standalone

# Install dependencies
npm install @angular/cdk primeng @primeng/themes primeicons
```

### Configuration Files

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

**vite.config.mts** (Critical for Performance)

```typescript
export default defineConfig({
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    drop: ['debugger'],
    pure: ['console.log', 'console.debug'],
  },
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    cssMinify: 'lightningcss',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 3,
        dead_code: true,
        reduce_vars: true,
      },
      mangle: { toplevel: true },
    },
  },
});
```

---

## 2. Rendering Strategies

### Zoneless + OnPush + Signals (Recommended)

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes, withPreloading(QuicklinkStrategy)),
  ],
};

// component.ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MyComponent {
  // Use signals for reactive state
  users = signal<User[]>([]);
  searchTerm = signal('');

  // Use computed for derived state (memoized)
  filteredUsers = computed(() =>
    this.users().filter((u) => u.name.includes(this.searchTerm()))
  );
}
```

### Key Benefits

- **OnPush**: Reduces change detection cycles by 80-90%
- **Signals**: Automatic memoization, precise dependency tracking
- **Zoneless**: Eliminates Zone.js overhead (~12KB)
- **Hydration**: 40% faster page loads with SSR

---

## 3. Bundle Optimization

### Code Splitting Strategy

```typescript
// app.routes.ts - Lazy load all routes
export const routes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
```

### Tree Shaking

```typescript
// Import only what you need
import { signal, computed } from '@angular/core';  // ✅ Good
import * as Core from '@angular/core';             // ❌ Bad

// PrimeNG tree-shakeable imports
import { ButtonModule } from 'primeng/button';     // ✅ Good
import * from 'primeng';                           // ❌ Bad
```

### Font Optimization

```html
<!-- index.html - Only WOFF2 -->
<link
  rel="preload"
  href="/fonts/primeicons.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- Remove WOFF, TTF, EOT formats -->
```

### Target Bundle Sizes

- Initial bundle: **< 500 KB** (gzipped: ~140 KB)
- Lazy chunks: **< 200 KB** each
- Total JavaScript: **< 1 MB**

---

## 4. WCAG Compliance

### Semantic HTML

```html
<!-- Use semantic elements -->
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<main id="main-content">
  <h1>Page Title</h1>
</main>
```

### Accessibility Features

```typescript
@Component({
  template: `
    <!-- Keyboard navigation -->
    <button (click)="submit()"
            (keydown.enter)="submit()"
            [attr.aria-label]="buttonLabel()">
      Submit
    </button>

    <!-- Form labels -->
    <label for="email">Email</label>
    <input id="email"
           type="email"
           [attr.aria-required]="true"
           [attr.aria-invalid]="emailInvalid()">

    <!-- Skip to main content -->
    <a href="#main-content" class="skip-link">
      Skip to main content
    </a>
  `
})
```

### Color Contrast

```scss
// Minimum contrast ratios (WCAG AA)
:root {
  --text-on-bg: #000000; // 21:1 on white
  --link-color: #0066cc; // 4.5:1 on white
  --button-bg: #2563eb; // 4.5:1 contrast
}
```

### Motion Preferences

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Performance Optimization

### Virtual Scrolling (Large Lists)

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="list">
      <div *cdkVirtualFor="let item of items(); trackBy: trackById">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

### Image Optimization

```html
<!-- Use NgOptimizedImage -->
<img ngSrc="/hero.jpg" width="1200" height="600" priority alt="Hero image" />

<!-- Lazy load non-critical images -->
<img ngSrc="/feature.jpg" width="800" height="400" loading="lazy" />
```

### Debouncing User Input

```typescript
export class SearchComponent {
  searchInput = signal('');
  searchTerm = signal('');

  constructor() {
    let timeoutId: number;
    effect(() => {
      const input = this.searchInput();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.searchTerm.set(input);
      }, 300) as unknown as number;
    });
  }
}
```

### Critical CSS

```html
<!-- Inline critical CSS in index.html -->
<style>
  body {
    font-family: system-ui;
    margin: 0;
  }
  .spinner {
    display: flex;
    min-height: 100vh;
    align-items: center;
  }
</style>
```

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: > 90

---

## 6. State Management

### Signals-Based (Recommended)

```typescript
// service.ts
@Injectable({ providedIn: 'root' })
export class UserStore {
  // Private state
  private _users = signal<User[]>([]);
  private _loading = signal(false);

  // Public readonly signals
  users = this._users.asReadonly();
  loading = this._loading.asReadonly();

  // Computed/derived state
  activeUsers = computed(() => this._users().filter((u) => u.active));

  // Actions
  async loadUsers() {
    this._loading.set(true);
    const data = await fetch('/api/users').then((r) => r.json());
    this._users.set(data);
    this._loading.set(false);
  }
}
```

### Component Usage

```typescript
export class UserListComponent {
  private userStore = inject(UserStore);

  // Access signals directly
  users = this.userStore.users;
  loading = this.userStore.loading;

  ngOnInit() {
    this.userStore.loadUsers();
  }
}
```

### When to Use External State Management

- Use **NgRx** for: Complex apps, time-travel debugging, strict patterns
- Use **Signals** for: Most apps, simpler API, better performance
- Avoid: Unnecessary complexity, over-engineering

---

## 7. Component Architecture

### Standalone Components (Required)

```typescript
// feature.component.ts
@Component({
  selector: 'app-feature',
  standalone: true, // Always true
  imports: [CommonModule, FormsModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class FeatureComponent {}
```

### Smart vs Presentational Pattern

```typescript
// Smart Component (Container)
@Component({
  selector: 'app-user-list-container',
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onUserSelected($event)"
    >
    </app-user-list>
  `,
})
export class UserListContainer {
  private store = inject(UserStore);
  users = this.store.users;
  loading = this.store.loading;

  onUserSelected(user: User) {
    this.store.selectUser(user);
  }
}

// Presentational Component (Dumb)
@Component({
  selector: 'app-user-list',
  template: `
    @if (loading()) {
    <div>Loading...</div>
    } @else { @for (user of users(); track user.id) {
    <div (click)="userSelected.emit(user)">
      {{ user.name }}
    </div>
    } }
  `,
})
export class UserListComponent {
  users = input.required<User[]>();
  loading = input<boolean>(false);
  userSelected = output<User>();
}
```

### Component Structure

```
src/app/
├── components/          # Presentational components
│   ├── button/
│   ├── card/
│   └── modal/
├── features/           # Feature modules
│   ├── users/
│   │   ├── list/
│   │   ├── detail/
│   │   └── users.routes.ts
│   └── auth/
├── services/           # Business logic
├── models/            # TypeScript interfaces
└── utils/             # Helper functions
```

---

## 8. Essential Best Practices

### Angular Modern APIs

```typescript
// ✅ Use new APIs
users = input.required<User[]>(); // instead of @Input()
selected = output<User>(); // instead of @Output()
viewChild = viewChild<ElementRef>('el'); // instead of @ViewChild()
```

### Template Syntax

```typescript
// ✅ Use built-in control flow
@if (condition) { ... }           // instead of *ngIf
@for (item of items; track item.id) { ... }  // instead of *ngFor
@switch (value) { ... }           // instead of *ngSwitch

// ✅ Use signals directly in templates
{{ users() }}                     // auto-updates
```

### Avoid Common Pitfalls

```typescript
// ❌ Don't use functions in templates
{
  {
    getUsers();
  }
} // Runs on every check!

// ✅ Use computed signals
users = computed(() => this.filter());

// ❌ Don't mutate signals
this.users().push(newUser); // Error!

// ✅ Use update/set
this.users.update((prev) => [...prev, newUser]);
```

---

## 9. Build & Deployment Checklist

### Pre-Deploy

- [ ] Remove all `console.log` statements
- [ ] Enable production mode
- [ ] Run `npm run build --configuration=production`
- [ ] Test bundle size: `ls -lh dist/*/`
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Verify all routes work
- [ ] Check WCAG with axe DevTools

### Headers Configuration

```nginx
# nginx.conf or _headers file
Cache-Control: public, max-age=31536000, immutable  # For hashed files
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: geolocation=(), microphone=()
```

---

## 10. Performance Monitoring

### Core Web Vitals Service

```typescript
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.observeWebVitals();
    }
  }

  private observeWebVitals() {
    // Track LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      this.reportMetric('LCP', lcp.renderTime || lcp.loadTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Track CLS
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      this.reportMetric('CLS', cls);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  private reportMetric(name: string, value: number) {
    // Send to analytics
    console.log(`${name}: ${value}`);
  }
}
```

---

## Quick Reference

### Essential Commands

```bash
# Development
npm start                          # Dev server
npm run build                      # Production build
npm run test                       # Run tests
npx lighthouse http://localhost:4200  # Performance audit

# Analysis
npx webpack-bundle-analyzer dist/*/stats.json  # Bundle analysis
npx source-map-explorer dist/**/*.js          # Source map analysis
```

### Key Metrics Target

| Metric                 | Target   | Current |
| ---------------------- | -------- | ------- |
| Lighthouse Performance | > 90     | 76      |
| Bundle Size (gzipped)  | < 150 KB | 140 KB  |
| LCP                    | < 2.5s   | 4.2s    |
| TBT                    | < 200ms  | 70ms    |
| CLS                    | < 0.1    | 0       |

### Resources

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Signals](https://angular.dev/guide/signals)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
