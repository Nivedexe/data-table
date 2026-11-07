# React Data Table Component

A powerful, customizable, and feature-rich Data Table component built for React and TypeScript applications.

## Features

- **Column Preferences & Customization**: Column visibility toggles, reordering, and reset capabilities via a settings popover.
- **Sorting**: Multi-column and single-column sorting with custom comparator support.
- **Filtering & Search**: Built-in search input and customizable filter options.
- **Density Control**: Support for multiple density views (e.g. compact, normal).
- **Pagination**: Configurable pagination with page size options and item count summary.
- **Selection & Bulk Actions**: Row selection (single/multi) and bulk action triggers.
- **Sticky Headers & Virtualization Ready**: Fixed header styling and full-height support.
- **TypeScript First**: Full type safety for columns, rows, actions, and table configurations.

## File Structure

```
├── column-settings-item.tsx     # Draggable/toggleable column item
├── column-settings-popover.tsx  # Column settings popover UI
├── data-table.tsx               # Main DataTable component
├── data-table.types.ts          # Type definitions and interfaces
├── data-table-body.tsx          # Table body & row rendering
├── data-table-header.tsx        # Table header & sort controls
├── data-table-pagination.tsx    # Pagination controls
├── data-table-toolbar.tsx       # Search, filter, density, and action toolbar
├── use-column-preferences.ts    # Hook for managing column visibility and order
└── index.ts                     # Public entry point and exports
```

## Usage

```tsx
import { DataTable, Column } from "./data-table"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const columns: Column<User>[] = [
  { id: "name", label: "Name", accessor: (row) => row.name, sortable: true },
  { id: "email", label: "Email", accessor: (row) => row.email },
  { id: "role", label: "Role", accessor: (row) => row.role, sortable: true },
]

export function UserTable({ users }: { users: User[] }) {
  return (
    <DataTable
      id="user-table"
      columns={columns}
      data={users}
      rowKey="id"
      searchable
      filterable
      selectable
      enableColumnSettings
    />
  )
}
```

## License

MIT

