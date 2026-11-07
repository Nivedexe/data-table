import { useEffect, useRef, type ReactNode } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Tooltip } from "../tooltip/index.ts"
import type { Column, SortConfig, TableDensity } from "./data-table.types.ts"
import { cn } from "@/lib/utils.ts"

export interface DataTableHeaderProps<T> {
  columns: Column<T>[]
  selectable?: boolean
  allSelected?: boolean
  isIndeterminate?: boolean
  onToggleSelectAll?: () => void
  sortConfig: SortConfig | null
  onSortClick: (column: Column<T>) => void
  stickyHeader?: boolean
  density?: TableDensity
  enableTooltips?: boolean
}

export function DataTableHeader<T>({
  columns,
  selectable = false,
  allSelected = false,
  isIndeterminate = false,
  onToggleSelectAll,
  sortConfig,
  onSortClick,
  stickyHeader = true,
  density = "compact",
  enableTooltips = true,
}: DataTableHeaderProps<T>) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const paddingClass =
    density === "compact"
      ? "px-3 py-1.5 text-[12px]"
      : density === "spacious"
        ? "px-4 py-3 text-[12px]"
        : "px-3.5 py-2 text-[12px]"

  return (
    <thead
      className={cn(
        "bg-[#F7F7F8] dark:bg-[#1E1E20] text-[#616161] dark:text-[#9CA3AF] border-b border-[#E5E7EB] dark:border-[#2D2D30] select-none font-medium normal-case tracking-normal h-[34px]",
        stickyHeader && "sticky top-0 z-20",
      )}
    >
      <tr>
        {/* Row selection master checkbox */}
        {selectable && (
          <th
            className={cn(
              "w-9 text-left align-middle bg-[#F7F7F8] dark:bg-[#1E1E20]",
              density === "compact" ? "px-3 py-1.5" : "px-3.5 py-2",
            )}
          >
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              aria-label="Select all rows"
              className="h-3.5 w-3.5 rounded border-border-primary bg-surface text-text-primary accent-text-primary focus:ring-1 focus:ring-text-primary/20 cursor-pointer"
            />
          </th>
        )}

        {/* Dynamic visible columns */}
        {columns.map((col) => {
          const colKey = col.id || col.key
          const isSorted = sortConfig?.key === colKey
          const isSortable = col.sortable !== false
          const tooltipText = col.description || col.tooltip

          const alignClass =
            col.align === "right"
              ? "text-right"
              : col.align === "center"
                ? "text-center"
                : "text-left"

          // Render Header content without underlined decoration
          const headerNode = (
            <span className={cn(enableTooltips && tooltipText && "cursor-help")}>
              {col.header as ReactNode}
            </span>
          )

          return (
            <th
              key={colKey}
              style={{ width: col.width, minWidth: col.minWidth }}
              className={cn(
                "align-middle transition-colors font-medium text-[#616161] dark:text-[#9CA3AF] bg-[#F7F7F8] dark:bg-[#1E1E20]",
                paddingClass,
                alignClass,
                isSortable && "cursor-pointer hover:text-text-primary",
                col.className,
              )}
              onClick={() => isSortable && onSortClick(col)}
            >
              <div
                className={cn(
                  "inline-flex items-center gap-1.5",
                  col.align === "right" && "justify-end",
                  col.align === "center" && "justify-center",
                )}
              >
                {enableTooltips && tooltipText ? (
                  <Tooltip
                    content={
                      <div className="max-w-[260px] text-[12px] font-normal normal-case leading-relaxed text-zinc-100 text-left">
                        {tooltipText}
                      </div>
                    }
                    side="bottom"
                    align="center"
                  >
                    {headerNode}
                  </Tooltip>
                ) : (
                  headerNode
                )}

                {/* Sort indicator arrow */}
                {isSortable && (
                  <span className="shrink-0 text-text-primary font-bold">
                    {isSorted ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="h-3 w-3 inline text-text-primary" />
                      ) : (
                        <ArrowDown className="h-3 w-3 inline text-text-primary" />
                      )
                    ) : null}
                  </span>
                )}
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
