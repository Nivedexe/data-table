import { useState, type ChangeEvent, type ReactNode } from "react"
import { Search, X, Columns3, RotateCcw } from "lucide-react"
import { ColumnSettingsPopover } from "./column-settings-popover.tsx"
import { Tooltip } from "../tooltip/index.ts"
import { Dropdown } from "../dropdown/index.ts"
import type {
  Column,
  SortConfig,
  TableToolbarAction,
  TableFilterOption,
  TableBulkAction,
} from "./data-table.types.ts"
import { cn } from "@/lib/utils.ts"

export interface DataTableToolbarProps<T> {
  searchable?: boolean
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void

  filterable?: boolean
  filterOptions?: TableFilterOption[]
  activeFilter?: string
  onFilterChange?: (value: string) => void

  toolbarActions?: TableToolbarAction[]
  actionsSlot?: ReactNode

  // Column settings & Reset view
  enableColumnSettings?: boolean
  showResetView?: boolean
  columns: Column<T>[]
  visibleKeys: string[]
  sortConfig: SortConfig | null
  onToggleColumnVisibility: (key: string) => void
  onReorderColumns: (sourceIndex: number, destinationIndex: number) => void
  onSortChange: (sort: SortConfig | null) => void
  onResetView: () => void

  // Bulk actions
  selectedCount?: number
  selectedRows?: T[]
  bulkActions?: TableBulkAction<T>[]
  onClearSelection?: () => void
  enableTooltips?: boolean
}

export function DataTableToolbar<T>({
  searchable = true,
  searchPlaceholder = "Search and filter",
  searchValue,
  onSearchChange,
  filterable = true,
  filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Archived", value: "archived" },
  ],
  activeFilter = "all",
  onFilterChange,
  toolbarActions,
  actionsSlot,
  enableColumnSettings = true,
  showResetView = true,
  columns,
  visibleKeys,
  sortConfig,
  onToggleColumnVisibility,
  onReorderColumns,
  onSortChange,
  onResetView,
  selectedCount = 0,
  selectedRows = [],
  bulkActions,
  onClearSelection,
  enableTooltips = true,
}: DataTableToolbarProps<T>) {
  const [isColumnPopoverOpen, setIsColumnPopoverOpen] = useState(false)

  const hasSelectedRows = selectedCount > 0

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-3 py-2 border-b border-border-primary bg-surface select-none shrink-0 min-h-[44px]">
      {hasSelectedRows ? (
        /* ========================================================= */
        /* Bulk Selection Mode Toolbar                               */
        /* ========================================================= */
        <div className="flex items-center justify-between w-full animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-text-primary px-2 py-0.5 rounded-md bg-hover-bg">
              {selectedCount} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[12px] text-text-secondary hover:text-text-primary hover:underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {bulkActions?.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => action.onClick(selectedRows)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer",
                  action.danger
                    ? "border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    : "border-border-primary text-text-primary hover:bg-hover-bg",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* Standard Table Toolbar                                    */
        /* ========================================================= */
        <>
          {/* Left: Filter selector + Search and filter input */}
          <div className="flex items-center gap-2 flex-1 max-w-md lg:max-w-lg min-w-0">
            {/* Filter Selector Dropdown powered by Dropdown */}
            {filterable && (
              <Dropdown
                value={activeFilter}
                onChange={(val) => onFilterChange?.(val)}
                options={filterOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                  badge: opt.badge,
                }))}
                size="md"
                placement="bottom"
                triggerClassName="h-8 text-[12px] px-2.5 font-medium shrink-0"
                menuClassName="w-36 min-w-[120px]"
              />
            )}

            {/* Search Input Container */}
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onSearchChange(e.target.value)
                  }
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-7 rounded-lg border border-border-primary bg-surface text-[13px] text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-text-primary focus:ring-1 focus:ring-text-primary/15"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5 rounded"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions (Add, Export, Print) + Column settings + Reset View */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap justify-end">
            {/* Custom ReactNode Slot */}
            {actionsSlot}

            {/* Custom Toolbar Actions (e.g. Add, Export, Print) */}
            {toolbarActions?.map((act, index) => {
              const Icon = act.icon
              const isPrimary = act.variant === "primary"
              const isGhost = act.variant === "ghost"

              const buttonNode = (
                <button
                  key={index}
                  type="button"
                  disabled={act.disabled}
                  onClick={act.onClick}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer shrink-0 select-none",
                    isPrimary
                      ? "bg-text-primary text-surface hover:opacity-90 border border-transparent shadow-xs"
                      : isGhost
                        ? "text-text-secondary hover:text-text-primary hover:bg-hover-bg"
                        : "border border-border-primary bg-surface hover:bg-hover-bg text-text-primary shadow-2xs",
                    act.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                    act.className,
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{act.label}</span>
                </button>
              )

              if (enableTooltips && act.tooltip) {
                return (
                  <Tooltip key={index} content={act.tooltip} side="top">
                    {buttonNode}
                  </Tooltip>
                )
              }

              return buttonNode
            })}

            {/* Subtle Divider between actions and view tools if actions exist */}
            {Boolean(toolbarActions?.length || actionsSlot) && (enableColumnSettings || showResetView) && (
              <div className="h-4 w-px bg-border-primary/60 mx-0.5 shrink-0" />
            )}

            {/* Column Settings Toggle Button */}
            {enableColumnSettings && (
              <div className="relative">
                {enableTooltips ? (
                  <Tooltip content="Customize columns" side="bottom">
                    <button
                      type="button"
                      onClick={() => setIsColumnPopoverOpen((p) => !p)}
                      aria-expanded={isColumnPopoverOpen}
                      aria-label="Customize columns and sorting"
                      className={cn(
                        "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-primary bg-surface hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs",
                        isColumnPopoverOpen && "bg-hover-bg ring-1 ring-border-primary text-text-primary",
                      )}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsColumnPopoverOpen((p) => !p)}
                    aria-expanded={isColumnPopoverOpen}
                    aria-label="Customize columns and sorting"
                    className={cn(
                      "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-primary bg-surface hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs",
                      isColumnPopoverOpen && "bg-hover-bg ring-1 ring-border-primary text-text-primary",
                    )}
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Column Settings Popover */}
                {isColumnPopoverOpen && (
                  <ColumnSettingsPopover
                    columns={columns}
                    visibleKeys={visibleKeys}
                    sortConfig={sortConfig}
                    onToggleVisibility={onToggleColumnVisibility}
                    onReorder={onReorderColumns}
                    onSortChange={onSortChange}
                    onClose={() => setIsColumnPopoverOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Dedicated Reset View Button */}
            {showResetView && (
              enableTooltips ? (
                <Tooltip content="Reset view" side="bottom">
                  <button
                    type="button"
                    onClick={onResetView}
                    aria-label="Reset view"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-primary bg-surface hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              ) : (
                <button
                  type="button"
                  onClick={onResetView}
                  aria-label="Reset view"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-primary bg-surface hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}
