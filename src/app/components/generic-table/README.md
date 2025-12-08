# Generic Table Component

## Overview

A modern, reusable Angular 21 table component built with signals and best practices. Supports pagination, sorting, filtering, and row selection out of the box.

## Features

✅ **Signal-based state management** - Reactive and performant  
✅ **Type-safe configuration** - Full TypeScript support with generics  
✅ **Highly customizable** - Configure columns, styling, behavior  
✅ **Built-in features** - Pagination, sorting, filtering, selection  
✅ **Virtual scrolling** - Handle large datasets efficiently  
✅ **State persistence** - Save table state to local/session storage  
✅ **OnPush change detection** - Optimized performance  
✅ **Standalone component** - No NgModules required

## Usage

### Basic Example

```typescript
import { Component, signal } from '@angular/core';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { TableConfig } from './components/generic-table/generic-table.models';

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

@Component({
  selector: 'app-users',
  template: `
    <app-generic-table
      [config]="tableConfig()"
      [data]="users()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      (rowSelect)="onRowSelect($event)"
      (pageChange)="onPageChange($event)"
    />
  `,
  imports: [GenericTableComponent],
})
export class UsersComponent {
  protected users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  ]);

  protected totalRecords = signal(2);
  protected loading = signal(false);

  protected tableConfig = signal<TableConfig<User>>({
    dataKey: 'id',
    selectable: true,
    paginator: true,
    filterable: true,
    columns: [
      { field: 'id', header: 'ID', sortable: true, width: '80px' },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'active', header: 'Active', type: 'boolean' },
    ],
  });

  protected onRowSelect(user: User): void {
    console.log('Selected:', user);
  }

  protected onPageChange(event: PageEvent): void {
    // Load next page from API
  }
}
```

### Advanced Configuration

```typescript
protected tableConfig = signal<TableConfig<User>>({
  dataKey: 'id',

  // Features
  selectable: true,
  multiSelect: true,
  paginator: true,
  sortable: true,
  filterable: true,

  // Pagination
  rows: 20,
  rowsPerPageOptions: [10, 20, 50, 100],

  // Styling
  styleClass: 'custom-table',
  tableStyle: { 'min-width': '1000px' },
  scrollable: true,
  scrollHeight: '600px',

  // Virtual scrolling for large datasets
  virtualScroll: true,
  virtualScrollItemSize: 72,

  // State persistence
  stateStorage: 'local',
  stateKey: 'users-table-v1',

  // Columns
  columns: [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      type: 'number',
    },
    {
      field: 'name',
      header: 'Full Name',
      sortable: true,
      formatter: (value, row) => value.toUpperCase(),
    },
    {
      field: 'role',
      header: 'Role',
      type: 'badge',
      template: 'badge',
    },
    {
      field: 'active',
      header: 'Status',
      type: 'boolean',
      width: '100px',
    },
  ],

  // Callbacks
  onRowSelect: (row) => console.log('Row clicked:', row),
  onRowsSelect: (rows) => console.log('Selected rows:', rows),
  onSort: (field, order) => console.log('Sorted:', field, order),
  onFilter: (value) => console.log('Filtered:', value),
  onPageChange: (page) => console.log('Page changed:', page),
});
```

## API Reference

### Inputs

| Input          | Type             | Default      | Description                  |
| -------------- | ---------------- | ------------ | ---------------------------- |
| `config`       | `TableConfig<T>` | **required** | Table configuration          |
| `data`         | `T[]`            | `[]`         | Array of data to display     |
| `totalRecords` | `number`         | `0`          | Total records for pagination |
| `loading`      | `boolean`        | `false`      | Loading state                |

### Outputs

| Output         | Type        | Description                  |
| -------------- | ----------- | ---------------------------- |
| `rowSelect`    | `T`         | Emits when a row is clicked  |
| `rowsSelect`   | `T[]`       | Emits when selection changes |
| `pageChange`   | `PageEvent` | Emits on page change         |
| `sortChange`   | `SortEvent` | Emits on sort change         |
| `filterChange` | `string`    | Emits on filter input        |

### TableConfig<T>

```typescript
interface TableConfig<T> {
  dataKey: keyof T | string; // Unique identifier field
  columns: TableColumn<T>[]; // Column definitions

  // Features
  selectable?: boolean; // Enable row selection
  multiSelect?: boolean; // Allow multiple selections
  paginator?: boolean; // Show pagination
  sortable?: boolean; // Enable sorting
  filterable?: boolean; // Show search filter

  // Pagination
  rows?: number; // Rows per page
  rowsPerPageOptions?: number[]; // Page size options

  // Styling
  styleClass?: string; // CSS class for table
  tableStyle?: Record<string, string>; // Inline styles
  scrollable?: boolean; // Enable scrolling
  scrollHeight?: string; // Scroll container height

  // Virtual scrolling
  virtualScroll?: boolean; // Enable virtual scroll
  virtualScrollItemSize?: number; // Item height in pixels

  // State
  stateStorage?: 'local' | 'session' | 'none';
  stateKey?: string; // Storage key

  // Callbacks
  onRowSelect?: (row: T) => void;
  onRowsSelect?: (rows: T[]) => void;
  onSort?: (field: string, order: number) => void;
  onFilter?: (value: string) => void;
  onPageChange?: (page: PageEvent) => void;
}
```

### TableColumn<T>

```typescript
interface TableColumn<T> {
  field: keyof T | string; // Data field name
  header: string; // Column header text
  sortable?: boolean; // Enable sorting
  filterable?: boolean; // Enable filtering
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions';
  class?: string; // CSS class
  width?: string; // Column width
  formatter?: (value: any, row: T) => string; // Value formatter
  template?: 'default' | 'badge' | 'actions' | 'checkbox' | 'custom';
}
```

## Column Types

### Boolean Column

```typescript
{ field: 'active', header: 'Active', type: 'boolean' }
```

Renders ✓ or ✗ icons.

### Badge Column

```typescript
{ field: 'status', header: 'Status', type: 'badge', template: 'badge' }
```

Renders value as PrimeNG tag/badge.

### Formatted Column

```typescript
{
  field: 'salary',
  header: 'Salary',
  formatter: (value) => `$${value.toLocaleString()}`
}
```

## Best Practices

### 1. Use Signals for All State

```typescript
protected users = signal<User[]>([]);
protected loading = signal(false);
```

### 2. Keep Configuration Immutable

```typescript
// ✅ Good - update entire config
this.tableConfig.update((config) => ({
  ...config,
  rows: 20,
}));

// ❌ Bad - mutate config
this.tableConfig().rows = 20;
```

### 3. Type Your Data Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const config: TableConfig<User> = { ... };
```

### 4. Use Callbacks for Side Effects

```typescript
const config: TableConfig<User> = {
  onRowSelect: (user) => {
    this.userService.trackClick(user.id);
  },
  onPageChange: (page) => {
    this.loadUsers(page.page, page.rows);
  },
};
```

## Performance Tips

1. **Enable Virtual Scrolling** for >100 rows
2. **Use OnPush Change Detection** (already enabled)
3. **Persist State** to avoid re-fetching data
4. **Lazy Load Data** on page change
5. **Debounce Filter Input** (handled internally)

## Migration from Old Table

```typescript
// Old way
@Input() columnDefinition: any[] = [];
@Input() tableData: any[] = [];
@Output() actionEventEmitter = new EventEmitter();

// New way with signals
config = input.required<TableConfig<User>>();
data = input<User[]>([]);
rowSelect = output<User>();
```

## Styling Customization

```scss
// Override in your component styles
::ng-deep {
  .generic-table-container {
    .selected-row {
      background-color: rgba(59, 130, 246, 0.2);
    }

    .p-datatable-header {
      background: var(--surface-ground);
    }
  }
}
```

## Dependencies

- `@angular/core` ^21.0.0
- `primeng` ^17.0.0
- `@angular/cdk` ^18.0.0

## License

MIT
