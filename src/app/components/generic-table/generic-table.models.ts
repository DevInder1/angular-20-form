/**
 * Generic Table Models
 * Type-safe configuration for reusable table component
 */

export interface TableColumn<T = any> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions' | 'custom';
  class?: string;
  width?: string;
  formatter?: (value: any, row: T) => string;
  template?: 'default' | 'badge' | 'actions' | 'checkbox' | 'custom';
}

export interface TableConfig<T = any> {
  // Data configuration
  dataKey: keyof T | string;
  columns: TableColumn<T>[];
  
  // Features
  selectable?: boolean;
  multiSelect?: boolean;
  paginator?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  
  // Pagination
  rows?: number;
  rowsPerPageOptions?: number[];
  
  // Styling
  styleClass?: string;
  tableStyle?: Record<string, string>;
  scrollable?: boolean;
  scrollHeight?: string;
  
  // Virtual scrolling
  virtualScroll?: boolean;
  virtualScrollItemSize?: number;
  
  // State
  stateStorage?: 'local' | 'session' | 'none';
  stateKey?: string;
  
  // Callbacks
  onRowSelect?: (row: T) => void;
  onRowsSelect?: (rows: T[]) => void;
  onSort?: (field: string, order: number) => void;
  onFilter?: (value: string) => void;
  onPageChange?: (page: PageEvent) => void;
}

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface SortEvent {
  field: string;
  order: number; // 1 = asc, -1 = desc
}

export interface TableState<T = any> {
  data: T[];
  totalRecords: number;
  loading: boolean;
  selectedRows: T[];
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: number;
  filterValue?: string;
}
