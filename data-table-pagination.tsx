import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip } from "../tooltip/index.ts"
import { Dropdown } from "../dropdown/index.ts"

export interface DataTablePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  enableTooltips?: boolean
}

export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 250, 500],
  showPageSizeSelector = true,
  enableTooltips = true,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const prevButton = (
    <button
      type="button"
      disabled={isFirstPage}
      onClick={() => onPageChange(currentPage - 1)}
      aria-label="Previous page"
      className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-text-primary hover:bg-hover-bg disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
    </button>
  )

  const nextButton = (
    <button
      type="button"
      disabled={isLastPage}
      onClick={() => onPageChange(currentPage + 1)}
      aria-label="Next page"
      className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-text-primary hover:bg-hover-bg disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  )

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#EEEEEE] dark:border-[#292929] px-3.5 py-1.5 bg-surface text-[12px] text-text-secondary select-none shrink-0 min-h-[40px]">
      {/* Left: Shopify Pill + Rows Selection */}
      <div className="flex items-center gap-2.5">
        {/* Shopify-style Compact Single Rounded Pill */}
        <div className="inline-flex items-center rounded-xl border border-border-primary bg-surface shadow-2xs p-0.5">
          {enableTooltips ? (
            <Tooltip content={isFirstPage ? "First page" : "Previous page"} side="top">
              {prevButton}
            </Tooltip>
          ) : (
            prevButton
          )}

          <span className="px-3 text-[12px] font-medium text-text-primary select-none whitespace-nowrap">
            {startItem}–{endItem}
          </span>

          {enableTooltips ? (
            <Tooltip content={isLastPage ? "Last page" : "Next page"} side="top">
              {nextButton}
            </Tooltip>
          ) : (
            nextButton
          )}
        </div>

        {/* Compact Rows count selector powered by Dropdown */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-text-muted text-[12px]">
            <span>Rows:</span>
            <Dropdown
              value={pageSize}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((opt) => ({
                value: opt,
                label: `${opt}`,
              }))}
              size="sm"
              placement="top"
              align="start"
              menuClassName="w-24 min-w-[90px]"
              triggerClassName="h-7 px-2 min-w-[56px] text-[12px] font-medium"
            />
          </div>
        )}
      </div>

      <div className="text-[12px] text-text-muted hidden sm:inline">
        Total: <span className="font-medium text-text-primary">{totalItems}</span>
      </div>
    </div>
  )
}
