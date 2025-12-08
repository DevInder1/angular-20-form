# Migration Guide: WebTableComponent → GenericTableComponent

## Overview

This guide shows how to migrate from the old `WebTableComponent` to the new `GenericTableComponent` using modern Angular 21 patterns with signals.

## Key Differences

| Old (WebTableComponent) | New (GenericTableComponent) |
| ----------------------- | --------------------------- |
| `@Input()` decorators   | `input()` signal function   |
| `@Output()` decorators  | `output()` function         |
| Template-driven state   | Signal-based state          |
| `any` types everywhere  | Fully typed with generics   |
| Complex template logic  | Simplified, reusable        |
| Imperative mutations    | Reactive updates            |

## Step-by-Step Migration

### Step 1: Define Your Data Interface

**Before:**

```typescript
columnDefinition: any[] = [];
tableData: any[] = [];
```

**After:**

```typescript
interface OverviewTable {
  id: number;
  field: string;
  header: string;
  sortOrder?: string;
  sortColumn?: string;
  class?: string;
  type?: string;
}

// Use the interface with generics
const config: TableConfig<OverviewTable> = { ... };
```

### Step 2: Convert Column Definitions

**Before:**

```typescript
columnDefinition = [
  { field: 'username', header: 'Username', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'active', header: 'Active', type: 'boolean' },
];
```

**After:**

```typescript
const tableConfig = signal<TableConfig<User>>({
  dataKey: 'id',
  columns: [
    { field: 'username', header: 'Username', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'active', header: 'Active', type: 'boolean' },
  ],
  // Additional configuration
  selectable: true,
  paginator: true,
  filterable: true,
});
```

### Step 3: Convert Inputs to Signals

**Before:**

```typescript
export class MyComponent {
  @Input() columnDefinition: T[] = [];
  @Input() tableData: U[] = [];
  @Input() rows = 0;
  @Input() currentPage = 0;
  @Input() totalRecords = 0;
  @Input() screenName!: string;
}
```

**After:**

```typescript
export class MyComponent {
  // Internal state as signals
  protected users = signal<User[]>([]);
  protected totalRecords = signal(0);
  protected loading = signal(false);

  // Configuration as signal
  protected tableConfig = signal<TableConfig<User>>({
    dataKey: 'id',
    rows: 10,
    columns: [...],
  });
}
```

### Step 4: Convert Outputs to Signal Outputs

**Before:**

```typescript
@Output() actionEventEmitter = new EventEmitter<U>();
@Output() tooltipEventEmitter = new EventEmitter<PrepareHintModel>();

sendSelectedRow(data: U, event: MouseEvent): void {
  this.actionEventEmitter.emit(data);
}
```

**After:**

```typescript
// In parent component
protected onRowSelect(user: User): void {
  console.log('Row selected:', user);
  // Handle selection
}

// In template
<app-generic-table
  [config]="tableConfig()"
  [data]="users()"
  (rowSelect)="onRowSelect($event)"
/>
```

### Step 5: Convert Event Handlers

**Before:**

```typescript
filterGlobal(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement.value;
  this.dt.filterGlobal(value, 'contains');
}

applySlice(rowData: string, field: string): string {
  // Complex logic
}
```

**After:**

```typescript
// Configuration handles it
const config: TableConfig<User> = {
  filterable: true,
  onFilter: (searchTerm) => {
    // Optional: add custom filter logic
    this.loadUsers(searchTerm);
  },
  columns: [
    {
      field: 'name',
      header: 'Name',
      formatter: (value) => {
        // Custom formatting
        return value.length > 20 ? value.slice(0, 20) + '...' : value;
      },
    },
  ],
};
```

### Step 6: Convert Template

**Before:**

```html
<p-table
  #dt
  [columns]="columnDefinition"
  [value]="tableData"
  [rowHover]="true"
  [(selection)]="itemsSelected"
  [dataKey]="tableConfiguration.dataKey"
  [rows]="rows"
>
  <ng-template pTemplate="header" let-columns>
    <!-- Complex header logic -->
  </ng-template>

  <ng-template pTemplate="body" let-rowData>
    <!-- Complex body logic -->
  </ng-template>
</p-table>
```

**After:**

```html
<app-generic-table
  [config]="tableConfig()"
  [data]="users()"
  [totalRecords]="totalRecords()"
  [loading]="loading()"
  (rowSelect)="onRowSelect($event)"
  (rowsSelect)="onRowsSelect($event)"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
  (filterChange)="onFilterChange($event)"
/>
```

## Complete Example

### Old Implementation

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <p-table
      #dt
      [columns]="columnDefinition"
      [value]="tableData"
      [rows]="rows"
      [totalRecords]="totalRecords"
    >
      <ng-template pTemplate="header" let-columns>
        <tr>
          @for (col of columns; track col) {
          <th>{{ col.header }}</th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-rowData>
        <tr>
          @for (col of columns; track col) {
          <td>{{ rowData[col.field] }}</td>
          }
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class UserListComponent {
  @Input() columnDefinition: any[] = [];
  @Input() tableData: any[] = [];
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Output() actionEventEmitter = new EventEmitter();

  sendSelectedRow(data: any): void {
    this.actionEventEmitter.emit(data);
  }
}
```

### New Implementation

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-user-list',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericTableComponent],
})
export class UserListComponent {
  // State
  protected users = signal<User[]>([]);
  protected totalRecords = signal(0);
  protected loading = signal(false);

  // Configuration
  protected tableConfig = signal<TableConfig<User>>({
    dataKey: 'id',
    selectable: true,
    paginator: true,
    filterable: true,
    rows: 10,
    rowsPerPageOptions: [10, 20, 50],
    columns: [
      { field: 'id', header: 'ID', width: '80px', sortable: true },
      { field: 'username', header: 'Username', sortable: true },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'role', header: 'Role', type: 'badge' },
      { field: 'active', header: 'Active', type: 'boolean' },
    ],
  });

  // Inject service
  private userService = inject(UserService);

  constructor() {
    this.loadUsers();
  }

  // Event handlers
  protected onRowSelect(user: User): void {
    console.log('Selected:', user);
  }

  protected onPageChange(event: PageEvent): void {
    this.loadUsers(event.page, event.rows);
  }

  // Load data
  private async loadUsers(page = 0, pageSize = 10): Promise<void> {
    this.loading.set(true);

    const result = await this.userService.getUsers(page, pageSize);

    this.users.set(result.data);
    this.totalRecords.set(result.total);
    this.loading.set(false);
  }
}
```

## Feature Mapping

### Selection

**Before:**

```typescript
@Input() itemsSelected: any[] = [];
@Output() selectedTableItemsChange = new EventEmitter<any[]>();

toggleSelection(rowData: any): void {
  const index = this.selectedTableItems.findIndex(/*...*/);
  // Complex logic
}
```

**After:**

```typescript
// Handled automatically by GenericTableComponent
const config: TableConfig<User> = {
  selectable: true,
  multiSelect: true,
  onRowsSelect: (selectedUsers) => {
    console.log('Selected users:', selectedUsers);
  },
};
```

### Filtering

**Before:**

```typescript
@Input() enableFiltering = false;
@Input() searchItem = '';

filterGlobal(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.dt.filterGlobal(value, 'contains');
}
```

**After:**

```typescript
// Built-in with configuration
const config: TableConfig<User> = {
  filterable: true,
  onFilter: (searchTerm) => {
    // Optional custom filter logic
    this.loadFilteredUsers(searchTerm);
  },
};
```

### Pagination

**Before:**

```typescript
@Input() rows = 0;
@Input() currentPage = 0;
@Input() totalRecords = 0;
@Input() pageChange!: Function;
```

**After:**

```typescript
const config: TableConfig<User> = {
  paginator: true,
  rows: 10,
  rowsPerPageOptions: [10, 20, 50],
  onPageChange: (event) => {
    this.loadUsers(event.page, event.rows);
  },
};
```

### Custom Formatting

**Before:**

```typescript
applySlice(rowData: string, field: string): string {
  if (rowData.length > 50) {
    return rowData.slice(0, 50) + '...';
  }
  return rowData;
}
```

**After:**

```typescript
const config: TableConfig<User> = {
  columns: [
    {
      field: 'description',
      header: 'Description',
      formatter: (value) => {
        return value.length > 50 ? value.slice(0, 50) + '...' : value;
      },
    },
  ],
};
```

## Benefits of Migration

✅ **Type Safety**: Full TypeScript support with generics  
✅ **Less Code**: 70% reduction in component code  
✅ **Better Performance**: Signal-based reactivity + OnPush  
✅ **Maintainability**: Single source of truth for configuration  
✅ **Reusability**: One component for all tables  
✅ **Modern Patterns**: Follows Angular 21 best practices  
✅ **Testing**: Easier to test with pure signal inputs

## Checklist

- [ ] Define data interface with proper types
- [ ] Create `TableConfig<T>` with column definitions
- [ ] Convert `@Input()` to `signal()` state
- [ ] Convert `@Output()` to event handlers
- [ ] Replace template with `<app-generic-table>`
- [ ] Test pagination, sorting, filtering
- [ ] Test row selection
- [ ] Verify state persistence (if enabled)
- [ ] Remove old `WebTableComponent` imports
- [ ] Update unit tests

## Need Help?

See the [README.md](./README.md) for complete API documentation and examples.
