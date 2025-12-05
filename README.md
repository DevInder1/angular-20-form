# Angular 21 + Nx + PrimeNG Form Layout

A modern Angular 21 project with Nx monorepo setup featuring a generic, reusable form layout component built with PrimeNG.

## Features

- **Angular 21** - Latest Angular framework with standalone components
- **Nx 22** - Advanced monorepo tooling for better development experience
- **PrimeNG** - Comprehensive UI component library with Aura theme
- **TypeScript** - Strict type checking for better code quality
- **Signals** - Modern reactive state management
- **OnPush Change Detection** - Optimized performance
- **WCAG AA Compliant** - Accessible forms with proper ARIA attributes
- **Responsive Design** - Mobile-friendly layouts

## Generic Form Layout Component

The `FormLayoutComponent` is a highly configurable, reusable component that accepts:

- **FormGroup** - Angular reactive form group
- **DetailFormConfiguration** - Configuration object defining form fields and behavior

### Supported Field Types

- `input` - Text input fields
- `textarea` - Multi-line text areas
- `number` - Numeric input with PrimeNG InputNumber
- `checkbox` - Boolean checkboxes
- `dropdown` - Select dropdowns with filtering
- `calendar` - Date/time pickers
- `password` - Password fields with toggle visibility
- `radio` - Radio button groups
- `button` - Action buttons
- `label` - Static text labels
- `panel` - Collapsible panels

### Usage Example

```typescript
import { FormBuilder, Validators } from '@angular/forms';
import { DetailFormConfiguration } from './models';

userForm = this.fb.group({
  firstName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  country: [null, Validators.required],
});

formConfiguration: DetailFormConfiguration = {
  label: 'User Registration',
  isSaveButton: true,
  discardButtonLabel: 'Cancel',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'input',
      required: true,
      placeholder: 'Enter your first name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'input',
      inputType: 'email',
      required: true,
    },
    {
      name: 'country',
      label: 'Country',
      type: 'dropdown',
      options: [
        { label: 'USA', value: 'US' },
        { label: 'UK', value: 'UK' },
      ],
      required: true,
      filter: true,
    },
  ],
};
```

```html
<app-form-layout [formGroup]="userForm" [configuration]="formConfiguration" />
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── form-layout/          # Generic form layout component
│   ├── models/                   # TypeScript interfaces and models
│   │   ├── form-entity-data.model.ts
│   │   ├── form-field.model.ts
│   │   └── detail-form-configuration.model.ts
│   ├── app.ts                    # Main app component
│   ├── app.config.ts             # App configuration with PrimeNG setup
│   └── app.routes.ts             # Routing configuration
├── styles.scss                   # Global styles and PrimeNG theme
└── index.html                    # Entry HTML
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### Development Server

Run the development server:

```bash
npx nx serve angular-21
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you change source files.

### Build

Build the project:

```bash
npx nx build angular-21
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

Execute unit tests:

```bash
npx nx test angular-21
```

Execute E2E tests:

```bash
npx nx e2e e2e
```

## Configuration

### PrimeNG Theme

The project uses PrimeNG's Aura theme configured in `app.config.ts`:

```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
});
```

### Form Field Configuration

Each field in the `DetailFormConfiguration` supports extensive customization:

- **Layout**: `isWide`, `isMid`, `class`, `cssClasses`
- **Validation**: `required`, `validators`, `maxLength`, `minLength`
- **UI Options**: `placeholder`, `hint`, `icon`, `filter`, `showClear`
- **Conditional Display**: `hide`, `isEditable`
- **Accessibility**: Automatic ARIA attributes

## Best Practices Followed

- ✅ Standalone components (no NgModules)
- ✅ Signals for state management
- ✅ OnPush change detection strategy
- ✅ `input()` and `output()` functions instead of decorators
- ✅ Native control flow (`@if`, `@for`, `@switch`)
- ✅ Strict TypeScript type checking
- ✅ WCAG AA accessibility compliance
- ✅ Responsive, mobile-first design

## Technologies

- **Angular**: 19.x
- **Nx**: 22.x
- **PrimeNG**: 19.x
- **TypeScript**: 5.x
- **Vite**: Build tool
- **Vitest**: Unit testing
- **Cypress**: E2E testing

## Architecture Highlights

- **Monorepo**: Nx workspace for scalability
- **Component-Driven**: Reusable, composable components
- **Type-Safe**: Full TypeScript coverage with strict mode
- **Performance**: OnPush change detection and signals
- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support

## Learn More

- [Angular Documentation](https://angular.dev)
- [Nx Documentation](https://nx.dev)
- [PrimeNG Documentation](https://primeng.org)
