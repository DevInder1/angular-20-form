import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import {
  TableColumn,
  TableConfig,
  PageEvent,
  SortEvent,
  TableState,
} from './generic-table.models';

/**
 * Generic reusable table component built with Angular 21 best practices
 * Uses signals for reactive state management
 * Supports pagination, sorting, filtering, row selection
 */
@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    PaginatorModule,
    TagModule,
  ],
})
export class GenericTableComponent<T extends Record<string, any>> {
  // Inputs using modern signal-based API
  config = input.required<TableConfig<T>>();
  data = input<T[]>([]);
  totalRecords = input<number>(0);
  loading = input<boolean>(false);

  // Outputs using modern output() function
  rowSelect = output<T>();
  rowsSelect = output<T[]>();
  pageChange = output<PageEvent>();
  sortChange = output<SortEvent>();
  filterChange = output<string>();

  // Internal state using signals
  protected selectedRows = signal<T[]>([]);
  protected searchTerm = signal<string>('');
  protected currentPage = signal<number>(0);
  protected pageSize = signal<number>(10);

  // ViewChild for table reference
  protected table = viewChild<Table>('dataTable');

  // Computed values for derived state
  protected columns = computed(() => this.config().columns);
  protected isSelectable = computed(() => this.config().selectable ?? false);
  protected isPaginated = computed(() => this.config().paginator ?? true);
  protected isFilterable = computed(() => this.config().filterable ?? true);
  protected dataKey = computed(() => this.config().dataKey as string);

  protected displayedData = computed(() => {
    const configData = this.data();
    return configData.length > 0 ? configData : [];
  });

  protected totalRecordsComputed = computed(() => {
    const total = this.totalRecords();
    return total > 0 ? total : this.displayedData().length;
  });

  protected hasData = computed(() => this.displayedData().length > 0);

  protected showSelectAll = computed(() => {
    const config = this.config();
    return config.selectable && config.multiSelect !== false;
  });

  protected allSelected = computed(() => {
    const rows = this.selectedRows();
    const data = this.displayedData();
    return data.length > 0 && rows.length === data.length;
  });

  protected someSelected = computed(() => {
    const rows = this.selectedRows();
    const allSel = this.allSelected();
    return rows.length > 0 && !allSel;
  });

  constructor() {
    // Effect to emit selected rows when they change
    effect(() => {
      const selected = this.selectedRows();
      if (selected.length > 0) {
        this.rowsSelect.emit(selected);
      }
    });

    // Effect to apply config callbacks
    effect(() => {
      const config = this.config();
      const selected = this.selectedRows();
      if (config.onRowsSelect && selected.length > 0) {
        config.onRowsSelect(selected);
      }
    });
  }

  // Row selection methods
  protected onRowClick(row: T): void {
    const config = this.config();
    this.rowSelect.emit(row);
    if (config.onRowSelect) {
      config.onRowSelect(row);
    }
  }

  protected toggleRowSelection(row: T, event: Event): void {
    event.stopPropagation();
    const key = this.dataKey();
    const selected = this.selectedRows();
    const index = selected.findIndex((r) => r[key] === row[key]);

    if (index > -1) {
      this.selectedRows.update((rows) => rows.filter((_, i) => i !== index));
    } else {
      this.selectedRows.update((rows) => [...rows, row]);
    }
  }

  protected isRowSelected(row: T): boolean {
    const key = this.dataKey();
    return this.selectedRows().some((r) => r[key] === row[key]);
  }

  protected toggleSelectAll(event: Event): void {
    event.stopPropagation();
    if (this.allSelected()) {
      this.selectedRows.set([]);
    } else {
      this.selectedRows.set([...this.displayedData()]);
    }
  }

  // Filtering
  protected onFilterChange(value: string): void {
    this.searchTerm.set(value);
    this.filterChange.emit(value);

    const config = this.config();
    if (config.onFilter) {
      config.onFilter(value);
    }

    const tableRef = this.table();
    if (tableRef) {
      tableRef.filterGlobal(value, 'contains');
    }
  }

  protected clearFilter(): void {
    this.searchTerm.set('');
    this.onFilterChange('');
  }

  // Pagination
  protected onPageChangeInternal(event: PageEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.pageChange.emit(event);

    const config = this.config();
    if (config.onPageChange) {
      config.onPageChange(event);
    }
  }

  // Sorting
  protected onSortChangeInternal(event: SortEvent): void {
    this.sortChange.emit(event);

    const config = this.config();
    if (config.onSort) {
      config.onSort(event.field, event.order);
    }
  }

  // Reset table state
  protected resetTable(): void {
    const tableRef = this.table();
    if (tableRef) {
      tableRef.reset();
    }
    this.selectedRows.set([]);
    this.searchTerm.set('');
    this.currentPage.set(0);
  }

  // Get column value with optional formatter
  protected getCellValue(row: T, column: TableColumn<T>): string {
    const value = row[column.field as keyof T];
    if (column.formatter) {
      return column.formatter(value, row);
    }
    return value != null ? String(value) : '';
  }

  // Get rows per page options
  protected getRowsPerPageOptions(): number[] {
    return this.config().rowsPerPageOptions ?? [10, 20, 30, 50];
  }
}
