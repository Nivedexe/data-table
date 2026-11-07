import { useState, useMemo, useCallback, isValidElement } from "react"
import { TableSkeleton } from "../skeleton/index.ts"
import { DataTableToolbar } from "./data-table-toolbar.tsx"
import { DataTableHeader } from "./data-table-header.tsx"
import { DataTableBody } from "./data-table-body.tsx"
import { DataTablePagination } from "./data-table-pagination.tsx"
import { useColumnPreferences } from "./use-column-preferences.ts"
import type {
  Column,
  SortConfig,
  DataTableToolbarConfig,
  DataTableProps as BaseDataTableProps,
} from "./data-table.types.ts"
import { cn } from "@/lib/utils.ts"

export type { Column } from "./data-table.types.ts"

export interface DataTableProps<T> extends BaseDataTableProps<T> {
  enableColumnSettings?: boolean
}

export function DataTable<T>({
  id,
  columns: rawColumns,
  data,
  rowKey,
  loading = false,
  emptyMessage = "No records found",
  stickyHeader = true,
  fullHeight = true,
  density = "compact",
  features,
  className,
  onRowClick,

  // Search & Filter
  searchable = false,
  searchPlaceholder = "Search and filter",
  filterable = false,
  filterOptions,
  activeFilter: controlledActiveFilter,
  onFilterChange: controlledOnFilterChange,

  // Actions & Selection
  toolbarActions,
  actionsSlot,
  bulkActions,
  selectable = false,
  selectedRowKeys: controlledSelectedRowKeys,
  onSelectionChange,

  // Column management & Sorting
  enableSorting = true,
  sortConfig: controlledSortConfig,
  defaultSort,
  onSortChange: controlledOnSortChange,
  enableColumnVisibility = true,
  enableColumnReordering = true,
  enableColumnSettings,
  showResetView: controlledShowResetView,
  persistColumnPreferences = true,

  // Pagination
  pagination,

  // Custom Toolbar slot (supports ReactNode or configuration object)
  toolbar,
}: DataTableProps<T>) {
  // Check if toolbar prop is an options object rather than a ReactNode
  const isToolbarConfigObject =
    toolbar !== null &&
    typeof toolbar === "object" &&
    !isValidElement(toolbar)

  const toolbarConfig = isToolbarConfigObject
    ? (toolbar as DataTableToolbarConfig)
    : null

  // Resolve feature flags from features prop or direct props
  const resolvedSearchable =
    features?.search ?? toolbarConfig?.searchable ?? searchable

  const resolvedFilterable =
    features?.filters ?? toolbarConfig?.filterable ?? filterable

  const resolvedSorting = features?.sorting ?? enableSorting

  const resolvedColumnManager =
    features?.columnManager ??
    toolbarConfig?.columnSettings ??
    enableColumnSettings ??
    (enableColumnVisibility || enableColumnReordering)

  const resolvedColumnReordering =
    features?.columnReordering ?? enableColumnReordering

  const resolvedColumnVisibility =
    features?.columnVisibility ?? enableColumnVisibility

  const resolvedShowResetView =
    features?.resetView ??
    toolbarConfig?.resetView ??
    controlledShowResetView ??
    Boolean(id)

  const resolvedSelectable = features?.selection ?? selectable

  const resolvedEnablePagination =
    features?.pagination !== false && pagination !== false

  const resolvedToolbarActions = toolbarConfig?.actions ?? toolbarActions
  const resolvedActionsSlot = toolbarConfig?.actionsSlot ?? actionsSlot
  const resolvedEnableTooltips = features?.tooltips ?? true

  // Default page size is 50
  const defaultPageSize =
    pagination && typeof pagination === "object"
      ? (pagination.pageSize || pagination.defaultPageSize || 50)
      : 50

  const pageSizeOptions =
    pagination && typeof pagination === "object" && pagination.pageSizeOptions
      ? pagination.pageSizeOptions
      : [25, 50, 100, 250]

  const showPageSizeSelector =
    features?.pageSizeSelector ??
    (pagination && typeof pagination === "object"
      ? (pagination.showPageSizeSelector ?? true)
      : true)

  // Column preferences (scoped persistence, reordering, visibility)
  const {
    visibleColumns,
    orderedColumns,
    visibleKeys,
    toggleColumnVisibility,
    reorderColumns,
    resetPreferences,
    savePreferences,
    initialPersisted,
  } = useColumnPreferences(id, rawColumns, persistColumnPreferences)

  // Internal state for uncontrolled props
  const [searchValue, setSearchValueState] = useState("")
  const [internalActiveFilter, setInternalActiveFilter] = useState("all")
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(() => {
    return initialPersisted?.sortConfig ?? defaultSort ?? null
  })
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([])
  const [currentPage, setCurrentPage] = useState<number>(
    pagination && typeof pagination === "object" && pagination.initialPage
      ? pagination.initialPage
      : 1,
  )
  const [pageSize, setPageSize] = useState<number>(() => {
    return initialPersisted?.pageSize ?? defaultPageSize
  })

  // Debounced search that resets to page 1
  const handleSearchChange = useCallback((value: string) => {
    setSearchValueState(value)
    setCurrentPage(1)
  }, [])

  const activeFilter = controlledActiveFilter ?? internalActiveFilter
  const handleFilterChange = (filterVal: string) => {
    if (controlledOnFilterChange) {
      controlledOnFilterChange(filterVal)
    } else {
      setInternalActiveFilter(filterVal)
    }
    setCurrentPage(1)
  }

  const sortConfig = controlledSortConfig !== undefined ? controlledSortConfig : internalSortConfig
  const handleSortChange = (sort: SortConfig | null) => {
    if (controlledOnSortChange) {
      controlledOnSortChange(sort)
    } else {
      setInternalSortConfig(sort)
    }
    savePreferences(visibleKeys, orderedColumns.map((c) => c.id || c.key), pageSize, sort)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    savePreferences(visibleKeys, orderedColumns.map((c) => c.id || c.key), newSize, sortConfig)
  }

  const handleResetView = useCallback(() => {
    resetPreferences()
    setInternalSortConfig(null)
    controlledOnSortChange?.(null)
    setPageSize(defaultPageSize)
    setCurrentPage(1)
  }, [resetPreferences, controlledOnSortChange, defaultPageSize])

  const selectedRowKeys = controlledSelectedRowKeys ?? internalSelectedKeys

  const getRowId = useCallback(
    (row: T, index?: number): string | number => {
      if (typeof rowKey === "function") {
        return rowKey(row, index)
      }
      const val = row[rowKey]
      return val !== undefined && val !== null ? (val as unknown as string | number) : (index ?? 0)
    },
    [rowKey],
  )

  // Row selection helpers
  const handleToggleSelectRow = (key: string | number) => {
    const next: (string | number)[] = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter((k: string | number) => k !== key)
      : [...selectedRowKeys, key]

    if (controlledSelectedRowKeys === undefined) {
      setInternalSelectedKeys(next)
    }

    if (onSelectionChange) {
      const selectedRows = data.filter((r, idx) => next.includes(getRowId(r, idx)))
      onSelectionChange(next, selectedRows)
    }
  }

  const handleClearSelection = () => {
    if (controlledSelectedRowKeys === undefined) {
      setInternalSelectedKeys([])
    }
    onSelectionChange?.([], [])
  }

  // 1. Filtering by search value and filter category
  const filteredData = useMemo(() => {
    let result = data

    // Category / status filter
    if (activeFilter && activeFilter !== "all") {
      result = result.filter((item) => {
        const itemRecord = item as Record<string, unknown>
        if ("status" in itemRecord) {
          return String(itemRecord.status).toLowerCase() === activeFilter.toLowerCase()
        }
        return true
      })
    }

    // Search query filter across searchable columns
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase().trim()
      const searchableCols = rawColumns.filter((col) => col.searchable !== false)

      result = result.filter((row) => {
        return searchableCols.some((col) => {
          const key = col.accessorKey || col.accessor
          if (!key) return false
          const val = row[key]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
      })
    }

    return result
  }, [data, activeFilter, searchValue, rawColumns])

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig || !resolvedSorting) return filteredData

    const col = rawColumns.find((c) => (c.id || c.key) === sortConfig.key)
    if (!col) return filteredData

    const accessorKey = col.accessorKey || col.accessor

    return [...filteredData].sort((a, b) => {
      const valA: unknown = accessorKey ? a[accessorKey] : null
      const valB: unknown = accessorKey ? b[accessorKey] : null

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      // Numeric comparison
      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA
      }

      // String comparison
      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      const res = strA.localeCompare(strB, undefined, { numeric: true })
      return sortConfig.direction === "asc" ? res : -res
    })
  }, [filteredData, sortConfig, resolvedSorting, rawColumns])

  // 3. Pagination slicing
  const totalCount =
    pagination && typeof pagination === "object" && typeof pagination.total === "number"
      ? pagination.total
      : sortedData.length

  const paginatedData = useMemo(() => {
    if (!resolvedEnablePagination) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, resolvedEnablePagination, currentPage, pageSize])

  // Select all logic for current page
  const currentPageRowKeys = useMemo(
    () => paginatedData.map((r, idx) => getRowId(r, idx)),
    [paginatedData, getRowId],
  )

  const allPageSelected =
    currentPageRowKeys.length > 0 &&
    currentPageRowKeys.every((k: string | number) => selectedRowKeys.includes(k))

  const somePageSelected =
    currentPageRowKeys.some((k: string | number) => selectedRowKeys.includes(k)) && !allPageSelected

  const handleToggleSelectAll = () => {
    let next: (string | number)[]
    if (allPageSelected) {
      next = selectedRowKeys.filter((k: string | number) => !currentPageRowKeys.includes(k))
    } else {
      const additions = currentPageRowKeys.filter((k: string | number) => !selectedRowKeys.includes(k))
      next = [...selectedRowKeys, ...additions]
    }

    if (controlledSelectedRowKeys === undefined) {
      setInternalSelectedKeys(next)
    }

    if (onSelectionChange) {
      const selectedRows = data.filter((r, idx) => next.includes(getRowId(r, idx)))
      onSelectionChange(next, selectedRows)
    }
  }

  // Header click sorting toggle
  const handleHeaderSortClick = (column: Column<T>) => {
    if (!resolvedSorting || column.sortable === false) return
    const colKey = column.id || column.key

    if (sortConfig?.key === colKey) {
      if (sortConfig.direction === "asc") {
        handleSortChange({ key: colKey, direction: "desc" })
      } else {
        handleSortChange(null)
      }
    } else {
      handleSortChange({ key: colKey, direction: "asc" })
    }
  }

  const selectedRowsList = useMemo(() => {
    return data.filter((r, idx) => selectedRowKeys.includes(getRowId(r, idx)))
  }, [data, selectedRowKeys, getRowId])

  if (loading) {
    return <TableSkeleton rows={pageSize} columns={visibleColumns.length} />
  }

  const hasAdvancedToolbar =
    resolvedSearchable ||
    resolvedFilterable ||
    (resolvedToolbarActions && resolvedToolbarActions.length > 0) ||
    resolvedColumnManager ||
    resolvedShowResetView ||
    selectedRowKeys.length > 0

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border-primary bg-surface overflow-hidden shadow-2xs flex flex-col",
        fullHeight && "flex-1 min-h-0",
        className,
      )}
    >
      {/* 1. Table Toolbar - fixed top (42-46px) */}
      {isValidElement(toolbar) ? (
        <div className="border-b border-border-primary px-3 py-2 bg-surface shrink-0 min-h-[44px]">
          {toolbar}
        </div>
      ) : hasAdvancedToolbar ? (
        <DataTableToolbar
          searchable={resolvedSearchable}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filterable={resolvedFilterable}
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          toolbarActions={resolvedToolbarActions}
          actionsSlot={resolvedActionsSlot}
          enableColumnSettings={resolvedColumnManager}
          showResetView={resolvedShowResetView}
          columns={orderedColumns}
          visibleKeys={visibleKeys}
          sortConfig={sortConfig}
          onToggleColumnVisibility={
            resolvedColumnVisibility ? toggleColumnVisibility : () => {}
          }
          onReorderColumns={
            resolvedColumnReordering ? reorderColumns : () => {}
          }
          onSortChange={handleSortChange}
          onResetView={handleResetView}
          selectedCount={selectedRowKeys.length}
          selectedRows={selectedRowsList}
          bulkActions={bulkActions}
          onClearSelection={handleClearSelection}
          enableTooltips={resolvedEnableTooltips}
        />
      ) : null}

      {/* 2. Table Content - independently scrollable body with sticky header */}
      <div className="overflow-auto w-full flex-1 min-h-0 relative">
        <table className="w-full text-left border-collapse">
          <DataTableHeader
            columns={visibleColumns}
            selectable={resolvedSelectable}
            allSelected={allPageSelected}
            isIndeterminate={somePageSelected}
            onToggleSelectAll={handleToggleSelectAll}
            sortConfig={sortConfig}
            onSortClick={handleHeaderSortClick}
            stickyHeader={stickyHeader}
            density={density}
            enableTooltips={resolvedEnableTooltips}
          />
          <DataTableBody
            columns={visibleColumns}
            data={paginatedData}
            rowKey={rowKey}
            selectable={resolvedSelectable}
            selectedRowKeys={selectedRowKeys}
            onToggleSelectRow={handleToggleSelectRow}
            onRowClick={onRowClick}
            emptyMessage={emptyMessage}
            density={density}
          />
        </table>
        {/* Shopify-style bottom fading gradient mask */}
        <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10" />
      </div>

      {/* 3. Table Footer / Compact Shopify Pagination - bottom anchored */}
      {resolvedEnablePagination && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
          enableTooltips={resolvedEnableTooltips}
        />
      )}
    </div>
  )
}
