import type { MouseEvent } from "react"
import type { Column, TableDensity } from "./data-table.types.ts"
import { cn } from "@/lib/utils.ts"

export interface DataTableBodyProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: keyof T | ((row: T, index?: number) => string | number)
  selectable?: boolean
  selectedRowKeys: (string | number)[]
  onToggleSelectRow: (key: string | number, row: T) => void
  onRowClick?: (row: T) => void
  emptyMessage?: string
  density?: TableDensity
}

export function DataTableBody<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedRowKeys,
  onToggleSelectRow,
  onRowClick,
  emptyMessage = "No records found",
  density = "compact",
}: DataTableBodyProps<T>) {
  const getRowId = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row, index)
    }
    const val = row[rowKey]
    return val !== undefined && val !== null ? String(val) : index
  }

  const colSpanTotal = columns.length + (selectable ? 1 : 0)

  // Density-specific cell padding
  const paddingClass =
    density === "compact"
      ? "px-3 py-2 text-[13px]"
      : density === "spacious"
        ? "px-4 py-3.5 text-[13px]"
        : "px-3.5 py-2.5 text-[13px]"

  if (data.length === 0) {
    return (
      <tbody className="bg-[#FFFFFF] dark:bg-[#141414] text-[#171717] dark:text-[#FAFAFA]">
        <tr>
          <td
            colSpan={colSpanTotal}
            className="px-4 py-12 text-center text-[12px] text-[#737373] dark:text-[#A3A3A3]"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="divide-y divide-[#EEEEEE] dark:divide-[#292929] bg-[#FFFFFF] dark:bg-[#141414] text-[#171717] dark:text-[#FAFAFA]">
      {data.map((row, index) => {
        const id = getRowId(row, index)
        const isSelected = selectedRowKeys.includes(id)

        const handleRowClick = () => {
          onRowClick?.(row)
        }

        const handleCheckboxClick = (e: MouseEvent<HTMLInputElement>) => {
          e.stopPropagation()
          onToggleSelectRow(id, row)
        }

        return (
          <tr
            key={id}
            onClick={handleRowClick}
            className={cn(
              "transition-colors duration-150",
              "hover:bg-[#F5F5F5] dark:hover:bg-[#242424]",
              isSelected && "bg-neutral-100 dark:bg-neutral-800/60",
              onRowClick && "cursor-pointer",
            )}
          >
            {/* Row Select Checkbox */}
            {selectable && (
              <td
                className={cn(
                  "w-9 align-middle",
                  density === "compact" ? "px-3 py-2" : "px-3.5 py-2.5",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={handleCheckboxClick}
                  aria-label={`Select row ${id}`}
                  className="h-3.5 w-3.5 rounded border-border-primary bg-surface text-text-primary accent-text-primary focus:ring-1 focus:ring-text-primary/20 cursor-pointer"
                />
              </td>
            )}

            {/* Dynamic visible column cells */}
            {columns.map((col) => {
              const colKey = col.id || col.key
              const alignClass =
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                    ? "text-center"
                    : "text-left"

              let cellContent: unknown = null
              if (col.render) {
                cellContent = col.render(row, index)
              } else if (col.accessorKey) {
                cellContent = row[col.accessorKey]
              } else if (col.accessor) {
                cellContent = row[col.accessor]
              }

              return (
                <td
                  key={colKey}
                  className={cn("align-middle", paddingClass, alignClass, col.className)}
                >
                  {cellContent !== null && cellContent !== undefined
                    ? (cellContent as React.ReactNode)
                    : "—"}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}
