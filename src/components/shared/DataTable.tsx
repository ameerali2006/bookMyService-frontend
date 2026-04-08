import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table"
import { cn } from "@/lib/utils"

export interface TableColumn<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  align?: "left" | "center" | "right"
  render?: (value: any, record: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string, order: "asc" | "desc") => void
  
}

export function DataTable<T extends { _id?: string }>({
  columns,
  data,
  loading,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  if (loading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHead
              key={String(col.key)}
              className={cn(
                col.align === "center" && "text-center",
                col.align === "right" && "text-right",
                col.sortable && "cursor-pointer select-none"
              )}
              onClick={() => {
                if (!col.sortable || !onSort) return
                const nextOrder =
                  sortBy === col.key && sortOrder === "asc" ? "desc" : "asc"
                onSort(String(col.key), nextOrder)
              }}
            >
              {col.title}
              {col.sortable && sortBy === col.key && (
                <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-6">
              No data found
            </TableCell>
          </TableRow>
        )}

        {data.map((row, index) => (
          <TableRow key={row._id ?? index}>
            {columns.map(col => {
              const value = (row as any)[col.key]
              return (
                <TableCell
                  key={String(col.key)}
                  className={cn(
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.render ? col.render(value, row) : value}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
