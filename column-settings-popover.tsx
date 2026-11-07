import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { Check } from "lucide-react"
import {
  ColumnSettingsItem,
  SortIcon,
  SelectCaretIcon,
} from "./column-settings-item.tsx"
import type { Column, SortConfig } from "./data-table.types.ts"
import { cn } from "@/lib/utils.ts"

export interface ColumnSettingsPopoverProps<T> {
  columns: Column<T>[]
  visibleKeys: string[]
  sortConfig: SortConfig | null
  onToggleVisibility: (key: string) => void
  onReorder: (sourceIndex: number, destinationIndex: number) => void
  onSortChange: (sort: SortConfig | null) => void
  onClose: () => void
}

// Each item is h-8 (32px) + space-y-1 (4px gap) = 36px step
const ITEM_STEP = 36

export function ColumnSettingsPopover<T>({
  columns,
  visibleKeys,
  sortConfig,
  onToggleVisibility,
  onReorder,
  onSortChange,
  onClose,
}: ColumnSettingsPopoverProps<T>) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)

  const startYRef = useRef(0)
  const activeIndexRef = useRef<number | null>(null)
  const overIndexRef = useRef<number | null>(null)

  // Close on click outside or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  // Fluid pointer drag handlers
  const handlePointerDownItem = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, index: number) => {
      startYRef.current = e.clientY
      activeIndexRef.current = index
      overIndexRef.current = index
      setDragIndex(index)
      setOverIndex(index)
      setDragOffsetY(0)

      const targetEl = e.currentTarget
      try {
        targetEl.setPointerCapture?.(e.pointerId)
      } catch {
        // Safe fallback if pointer capture isn't supported
      }

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (activeIndexRef.current === null) return
        moveEvent.preventDefault()

        const delta = moveEvent.clientY - startYRef.current
        setDragOffsetY(delta)

        const shift = Math.round(delta / ITEM_STEP)
        const target = Math.max(
          0,
          Math.min(columns.length - 1, activeIndexRef.current + shift),
        )
        if (target !== overIndexRef.current) {
          overIndexRef.current = target
          setOverIndex(target)
        }
      }

      const handlePointerUp = (upEvent: PointerEvent) => {
        try {
          targetEl.releasePointerCapture?.(upEvent.pointerId)
        } catch {
          // Ignore
        }

        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", handlePointerUp)
        window.removeEventListener("pointercancel", handlePointerUp)

        const source = activeIndexRef.current
        const dest = overIndexRef.current

        if (source !== null && dest !== null && source !== dest) {
          onReorder(source, dest)
        }

        activeIndexRef.current = null
        overIndexRef.current = null
        setDragIndex(null)
        setOverIndex(null)
        setDragOffsetY(0)
      }

      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      window.addEventListener("pointercancel", handlePointerUp)
    },
    [columns.length, onReorder],
  )

  // Current sort column
  const currentSortColumn = columns.find((c) => (c.id || c.key) === sortConfig?.key)
  const sortableColumns = columns.filter((c) => c.sortable !== false)

  const currentSortKey =
    sortConfig?.key ||
    (sortableColumns[0] ? sortableColumns[0].id || sortableColumns[0].key : "")
  const currentDirection = sortConfig?.direction || "asc"

  const handleSelectColumn = (key: string) => {
    onSortChange({
      key,
      direction: currentDirection,
    })
    setShowSortDropdown(false)
  }

  const handleSelectDirection = (direction: "asc" | "desc") => {
    onSortChange({
      key: currentSortKey,
      direction,
    })
    setShowSortDropdown(false)
  }

  const currentSortLabel = currentSortColumn?.header
    ? String(currentSortColumn.header)
    : sortableColumns[0]
      ? String(sortableColumns[0].header)
      : "Product"

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Customize columns and sorting"
      className={cn(
        "absolute right-0 top-full mt-1.5 w-[276px] rounded-2xl border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-[#1a1a1e] shadow-xl shadow-black/5 dark:shadow-black/40",
        "p-3 z-50 animate-in fade-in zoom-in-95 duration-100 select-none",
      )}
    >
      {/* ========================================================= */}
      {/* Top: Sort By Section (Matching Shopify Polaris)           */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 text-[13px] font-normal text-zinc-900 dark:text-zinc-100">
          <SortIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          <span>Sort by</span>
        </div>

        {/* Sort Column Trigger Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortDropdown((p) => !p)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 text-[12px] font-medium text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[110px]">{currentSortLabel}</span>
            <SelectCaretIcon className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />
          </button>

          {/* Secondary Flyout Dropdown */}
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1e] shadow-xl p-1 z-50 animate-in fade-in duration-100">
              {/* Column options */}
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {sortableColumns.map((col) => {
                  const key = col.id || col.key
                  const isSelected = currentSortKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectColumn(key)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] text-left transition-colors cursor-pointer",
                        isSelected
                          ? "font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60",
                      )}
                    >
                      <span className="truncate">{col.header as ReactNode}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Divider Line */}
              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              {/* Direction options */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleSelectDirection("asc")}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] text-left transition-colors cursor-pointer",
                    currentDirection === "asc"
                      ? "font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60",
                  )}
                >
                  <span>Ascending</span>
                  {currentDirection === "asc" && (
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDirection("desc")}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] text-left transition-colors cursor-pointer",
                    currentDirection === "desc"
                      ? "font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60",
                  )}
                >
                  <span>Descending</span>
                  {currentDirection === "desc" && (
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Middle: Columns List (Fluid Polaris Sortable)             */}
      {/* ========================================================= */}
      <div className="pt-2">
        <div className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 pb-1.5 px-1">
          Columns
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto overflow-x-hidden p-0.5 relative">
          {columns.map((col, index) => {
            const key = col.id || col.key
            const isVisible = visibleKeys.includes(key)
            const hideable = col.hideable !== false

            // Compute fluid vertical displacement
            let transformY = 0
            const isCurrentlyDragging = dragIndex === index

            if (isCurrentlyDragging) {
              transformY = dragOffsetY
            } else if (dragIndex !== null && overIndex !== null) {
              if (dragIndex < overIndex) {
                if (index > dragIndex && index <= overIndex) {
                  transformY = -ITEM_STEP
                }
              } else if (dragIndex > overIndex) {
                if (index < dragIndex && index >= overIndex) {
                  transformY = ITEM_STEP
                }
              }
            }

            return (
              <ColumnSettingsItem
                key={key}
                id={key}
                label={col.header}
                visible={isVisible}
                hideable={hideable}
                index={index}
                isDragging={isCurrentlyDragging}
                transformY={transformY}
                onToggleVisibility={onToggleVisibility}
                onPointerDownItem={handlePointerDownItem}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
