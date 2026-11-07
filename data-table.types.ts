import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export type SortDirection = "asc" | "desc"

export type TableDensity = "compact" | "comfortable" | "spacious"

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface Column<T> {
  id?: string
  key: string
  header: ReactNode
  accessor?: keyof T
  accessorKey?: keyof T
  render?: (row: T, index: number) => ReactNode
  align?: "left" | "center" | "right"
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  hideable?: boolean // default true; if false, cannot be hidden in column settings
  defaultVisible?: boolean // default true; if false, column is unchecked by default
  searchable?: boolean // default true
  tooltip?: string // Dotted underline with hover tooltip description
  description?: string // Informative tooltip description
  dataType?: "string" | "number" | "date" // Type for sort labels: A-Z, Low-High, Oldest-Newest
  className?: string
}

export interface TableToolbarAction {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost"
  tooltip?: string
  disabled?: boolean
  className?: string
}

export interface TableFilterOption {
  label: string
  value: string
  badge?: number | string
}

export interface TableBulkAction<T> {
  label: string
  icon?: LucideIcon
  onClick: (selectedRows: T[]) => void
  danger?: boolean
}

export interface DataTablePaginationConfig {
  pageSize?: number // default 50
  defaultPageSize?: number // alias for pageSize
  initialPage?: number
  total?: number
  pageSizeOptions?: number[] // default [25, 50, 100, 250]
  showPageSizeSelector?: boolean
}

export interface DataTableToolbarConfig {
  searchable?: boolean
  filterable?: boolean
  columnSettings?: boolean
  resetView?: boolean
  actions?: TableToolbarAction[]
  actionsSlot?: ReactNode
}

export interface DataTableFeatures {
  search?: boolean
  filters?: boolean
  sorting?: boolean
  columnManager?: boolean
  columnReordering?: boolean
  columnVisibility?: boolean
  resetView?: boolean
  selection?: boolean
  pagination?: boolean
  pageSizeSelector?: boolean
  tooltips?: boolean
}

export interface DataTableProps<T> {
  id?: string // Unique table ID for scoped localStorage column preferences
  columns: Column<T>[]
  data: T[]
  rowKey: keyof T | ((row: T, index?: number) => string | number)
  loading?: boolean
  density?: TableDensity // default 'compact'
  features?: DataTableFeatures

  // Search & Filter toolbar
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  filterOptions?: TableFilterOption[]
  activeFilter?: string
  onFilterChange?: (filterValue: string) => void

  // Actions & Selection
  toolbarActions?: TableToolbarAction[]
  actionsSlot?: ReactNode
  bulkActions?: TableBulkAction<T>[]
  selectable?: boolean
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (selectedKeys: (string | number)[], selectedRows: T[]) => void

  // Column management & Sorting
  enableSorting?: boolean
  sortConfig?: SortConfig | null
  defaultSort?: SortConfig | null
  onSortChange?: (config: SortConfig | null) => void
  enableColumnVisibility?: boolean
  enableColumnReordering?: boolean
  enableColumnSettings?: boolean
  showResetView?: boolean
  persistColumnPreferences?: boolean

  // Pagination
  pagination?: DataTablePaginationConfig | false

  // Layout & Styling
  fullHeight?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  stickyHeader?: boolean
  className?: string
  toolbar?: ReactNode | DataTableToolbarConfig
}
