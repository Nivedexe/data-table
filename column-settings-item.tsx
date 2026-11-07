import type { ReactNode } from "react"
import { cn } from "@/lib/utils.ts"

export function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="6" cy="8" r="1.25" />
      <circle cx="6" cy="3.25" r="1.25" />
      <circle cx="6" cy="12.75" r="1.25" />
      <circle cx="10" cy="8" r="1.25" />
      <circle cx="10" cy="3.25" r="1.25" />
      <circle cx="10" cy="12.75" r="1.25" />
    </svg>
  )
}

export function ViewIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.75 8c0 .875-2.332 5.25-6.75 5.25s-6.75-4.375-6.75-5.25 2.332-5.25 6.75-5.25 6.75 4.375 6.75 5.25" />
      <path d="M10.25 8a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0" />
    </svg>
  )
}

export function HideIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.488 3.36c.701.388 1.28.872 1.751 1.382 1.078 1.17 1.588 2.476 1.738 3.076a.75.75 0 0 1 0 .364c-.15.6-.66 1.906-1.738 3.076-1.098 1.192-2.789 2.242-5.239 2.242-2.133 0-3.738-.796-4.863-1.788l1.064-1.064c.882.753 2.124 1.352 3.799 1.352 1.968 0 3.277-.825 4.137-1.758a6.4 6.4 0 0 0 1.333-2.242 6.4 6.4 0 0 0-1.333-2.242 5.4 5.4 0 0 0-1.767-1.28zm-3.488-.86c.723 0 1.38.093 1.975.253l-1.283 1.282a7 7 0 0 0-.692-.035c-1.974 0-3.348.83-4.238 1.767-.45.472-.774.97-.983 1.398-.221.453-.279.753-.279.835s.058.382.28.835c.106.219.243.457.412.7l-1.073 1.073a7 7 0 0 1-.687-1.115c-.26-.532-.432-1.075-.432-1.493s.172-.961.432-1.493a7.2 7.2 0 0 1 1.243-1.774c1.13-1.188 2.88-2.233 5.325-2.233" />
      <path d="M9.323 6.5a2 2 0 1 1-2.925 2.697" />
      <path d="M12.592 2.257a.75.75 0 0 1 1.06 1.06l-10.335 10.336a.75.75 0 1 1-1.06-1.06z" />
    </svg>
  )
}

export function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 11.25v-9.5m2.25 2.25-2.25-2.25-2.25 2.25" />
      <path d="M11 4.75v9.5m2.25-2.25-2.25 2.25-2.25-2.25" />
    </svg>
  )
}

export function SelectCaretIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m11 10.5-3 2.748-3-2.748" />
      <path d="m5 5.5 3-2.75 3 2.75" />
    </svg>
  )
}

export interface ColumnSettingsItemProps {
  id: string
  label: ReactNode
  visible: boolean
  hideable: boolean
  index: number
  isDragging?: boolean
  transformY?: number
  onToggleVisibility: (id: string) => void
  onPointerDownItem?: (e: React.PointerEvent<HTMLDivElement>, index: number) => void
}

export function ColumnSettingsItem({
  id,
  label,
  visible,
  hideable,
  index,
  isDragging = false,
  transformY = 0,
  onToggleVisibility,
  onPointerDownItem,
}: ColumnSettingsItemProps) {
  const labelString = typeof label === "string" ? label : "Column"

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button (left click)
    if (e.button !== 0) return
    // Prevent dragging when clicking interactive toggle buttons
    if ((e.target as HTMLElement).closest("[data-no-drag]")) {
      return
    }
    // Prevent native browser selection / HTML5 ghost
    e.preventDefault()
    onPointerDownItem?.(e, index)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={false}
      onPointerDown={handlePointerDown}
      style={{
        transform: `translate3d(0, ${transformY}px, 0)`,
        transition: isDragging ? "none" : "transform 160ms cubic-bezier(0.2, 0, 0, 1)",
        zIndex: isDragging ? 50 : 1,
      }}
      className={cn(
        "group relative flex items-center justify-between h-8 px-2 rounded-lg text-[13px] select-none cursor-grab active:cursor-grabbing",
        "text-zinc-900 dark:text-zinc-100",
        isDragging
          ? "bg-white dark:bg-[#222226] shadow-lg shadow-black/10 dark:shadow-black/50 border border-zinc-200/90 dark:border-zinc-700/80 z-50 pointer-events-none"
          : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors duration-150",
      )}
    >
      {/* Left: Drag Handle Icon + Column Label */}
      <div className="flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
        <span
          className="text-zinc-900 dark:text-zinc-100 inline-flex shrink-0 p-0.5"
          aria-hidden="true"
        >
          <DragHandleIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
        </span>

        <span
          className={cn(
            "truncate text-[13px] tracking-tight",
            visible
              ? "font-normal text-zinc-900 dark:text-zinc-100"
              : "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-600",
          )}
        >
          {label}
        </span>
      </div>

      {/* Right: Visibility Eye Toggle */}
      <button
        type="button"
        data-no-drag="true"
        disabled={!hideable}
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility(id)
        }}
        className={cn(
          "p-1 rounded-md transition-colors cursor-pointer text-zinc-900 dark:text-zinc-100 shrink-0",
          hideable
            ? "hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70"
            : "opacity-20 cursor-not-allowed",
        )}
        aria-label={visible ? `Hide ${labelString}` : `Show ${labelString}`}
      >
        {visible ? (
          <ViewIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
        ) : (
          <HideIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        )}
      </button>
    </div>
  )
}
