import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GenericTableComponent } from './generic-table/generic-table.component';
import { TableConfig, TableColumn, PageEvent, SortEvent } from './generic-table/generic-table.models';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  company: string;
}

/**
 * Example usage of GenericTableComponent
 * Demonstrates best practices with signals and modern Angular patterns
 */
@Component({
  selector: 'app-table-example',
  template: `
    <div class="example-container">
      <h2>Generic Table Example</h2>
      
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
    </div>
  `,
  styles: [`
    .example-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 1.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericTableComponent],
})
export class TableExampleComponent {
  // State using signals
  protected users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true, company: 'Acme Corp' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: true, company: 'Tech Inc' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', active: false, company: 'Acme Corp' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', active: true, company: 'StartupXYZ' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', active: true, company: 'Tech Inc' },
  ]);
  
  protected totalRecords = signal<number>(5);
  protected loading = signal<boolean>(false);

  // Table configuration using signal
  protected tableConfig = signal<TableConfig<User>>({
    dataKey: 'id',
    selectable: true,
    multiSelect: true,
    paginator: true,
    sortable: true,
    filterable: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 20],
    stateStorage: 'session',
    stateKey: 'user-table-state',
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
        header: 'Name',
        sortable: true,
        type: 'text',
      },
      {
        field: 'email',
        header: 'Email',
        sortable: true,
        type: 'text',
      },
      {
        field: 'role',
        header: 'Role',
        sortable: true,
        type: 'badge',
        template: 'badge',
      },
      {
        field: 'company',
        header: 'Company',
        sortable: true,
        type: 'text',
      },
      {
        field: 'active',
        header: 'Active',
        sortable: true,
        type: 'boolean',
        width: '100px',
      },
    ],
    onRowSelect: (user) => console.log('Row selected:', user),
    onRowsSelect: (users) => console.log('Rows selected:', users),
  });

  // Event handlers
  protected onRowSelect(user: User): void {
    console.log('Selected user:', user);
  }

  protected onRowsSelect(users: User[]): void {
    console.log('Selected users:', users);
  }

  protected onPageChange(event: PageEvent): void {
    console.log('Page changed:', event);
    // Simulate API call
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  protected onSortChange(event: SortEvent): void {
    console.log('Sort changed:', event);
    // Implement sorting logic
    const field = event.field as keyof User;
    const order = event.order;
    
    this.users.update(users => {
      const sorted = [...users].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (aVal < bVal) return order === 1 ? -1 : 1;
        if (aVal > bVal) return order === 1 ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  }

  protected onFilterChange(searchTerm: string): void {
    console.log('Filter changed:', searchTerm);
    // Implement client-side filtering or trigger API call
    // For server-side filtering, make API call with search term
  }
}
