import { useState, useCallback, useMemo } from "react"
import type { Column, SortConfig } from "./data-table.types.ts"

export interface PersistedPreferences {
  visibleKeys: string[]
  orderKeys: string[]
  pageSize?: number
  sortConfig?: SortConfig | null
}

export function useColumnPreferences<T>(
  tableId: string | undefined,
  columns: Column<T>[],
  persist: boolean = true,
) {
  const defaultKeys = useMemo(
    () => columns.map((col) => col.id || col.key),
    [columns],
  )
  const defaultVisibleKeys = useMemo(
    () =>
      columns
        .filter((col) => col.defaultVisible !== false)
        .map((col) => col.id || col.key),
    [columns],
  )
  const defaultKeysKey = defaultKeys.join(",")

  const storageKey = tableId ? `gmp-table-prefs-${tableId}` : null

  // Read initial persisted state
  const initialPersisted = useMemo<PersistedPreferences | null>(() => {
    if (persist && storageKey && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          return JSON.parse(stored) as PersistedPreferences
        }
      } catch {
        // Ignore JSON error
      }
    }
    return null
  }, [persist, storageKey])

  // Initialize order and visibility
  const [orderKeys, setOrderKeys] = useState<string[]>(() => {
    if (initialPersisted && Array.isArray(initialPersisted.orderKeys) && initialPersisted.orderKeys.length > 0) {
      const valid = initialPersisted.orderKeys.filter((k) => defaultKeys.includes(k))
      const missing = defaultKeys.filter((k) => !valid.includes(k))
      return [...valid, ...missing]
    }
    return defaultKeys
  })

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    if (initialPersisted && Array.isArray(initialPersisted.visibleKeys) && initialPersisted.visibleKeys.length > 0) {
      const valid = initialPersisted.visibleKeys.filter((k) => defaultKeys.includes(k))
      return valid.length > 0 ? valid : defaultVisibleKeys
    }
    return defaultVisibleKeys
  })

  // Synchronize during render if columns definition changes (standard React prop sync pattern)
  const [prevDefaultKeysKey, setPrevDefaultKeysKey] = useState(defaultKeysKey)
  if (prevDefaultKeysKey !== defaultKeysKey) {
    setPrevDefaultKeysKey(defaultKeysKey)
    const validOrder = orderKeys.filter((k) => defaultKeys.includes(k))
    const missingOrder = defaultKeys.filter((k) => !validOrder.includes(k))
    setOrderKeys([...validOrder, ...missingOrder])

    const validVisible = visibleKeys.filter((k) => defaultKeys.includes(k))
    setVisibleKeys(validVisible.length > 0 ? validVisible : defaultKeys)
  }

  // Save to localStorage
  const savePreferences = useCallback(
    (newVisible: string[], newOrder: string[], newPageSize?: number, newSort?: SortConfig | null) => {
      if (!persist || !storageKey || typeof window === "undefined") return
      try {
        const data: PersistedPreferences = {
          visibleKeys: newVisible,
          orderKeys: newOrder,
          pageSize: newPageSize,
          sortConfig: newSort,
        }
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch {
        // Ignore write error
      }
    },
    [persist, storageKey],
  )

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      const col = columns.find((c) => (c.id || c.key) === key)
      if (col && col.hideable === false) return // non-hideable

      setVisibleKeys((prev) => {
        let next: string[]
        if (prev.includes(key)) {
          // Do not allow hiding all columns (keep at least 1)
          if (prev.length <= 1) return prev
          next = prev.filter((k) => k !== key)
        } else {
          next = [...prev, key]
        }
        savePreferences(next, orderKeys)
        return next
      })
    },
    [columns, orderKeys, savePreferences],
  )

  const reorderColumns = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      if (sourceIndex === destinationIndex) return

      setOrderKeys((prev) => {
        const updated = [...prev]
        const [moved] = updated.splice(sourceIndex, 1)
        updated.splice(destinationIndex, 0, moved)
        savePreferences(visibleKeys, updated)
        return updated
      })
    },
    [visibleKeys, savePreferences],
  )

  const resetPreferences = useCallback(() => {
    setOrderKeys(defaultKeys)
    setVisibleKeys(defaultVisibleKeys)
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore
      }
    }
  }, [defaultKeys, defaultVisibleKeys, storageKey])

  // Compute final ordered and visible column list
  const orderedColumns = useMemo(() => {
    const colMap = new Map<string, Column<T>>()
    columns.forEach((c) => colMap.set(c.id || c.key, c))

    return orderKeys
      .map((key) => colMap.get(key))
      .filter((c): c is Column<T> => c !== undefined)
  }, [columns, orderKeys])

  const visibleColumns = useMemo(() => {
    return orderedColumns.filter((c) => visibleKeys.includes(c.id || c.key))
  }, [orderedColumns, visibleKeys])

  return {
    orderKeys,
    visibleKeys,
    orderedColumns,
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    resetPreferences,
    savePreferences,
    initialPersisted,
  }
}
