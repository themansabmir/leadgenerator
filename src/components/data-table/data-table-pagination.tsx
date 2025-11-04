"use client"

import * as React from "react"
import { type Table as TanStackTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props<TData> = {
  table: TanStackTable<TData>
}

export function DataTablePagination<TData>({ table }: Props<TData>) {
  const page = table.getState().pagination.pageIndex + 1
  const pageCount = table.getPageCount()

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          « First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ‹ Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next ›
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(Math.max(0, pageCount - 1))}
          disabled={!table.getCanNextPage()}
        >
          Last »
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Page</span>
        <Input
          type="number"
          className="h-8 w-16"
          min={1}
          max={pageCount || 1}
          value={Number.isFinite(page) ? page : 1}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (Number.isFinite(next)) {
              table.setPageIndex(Math.max(0, Math.min(pageCount - 1, next - 1)))
            }
          }}
        />
        <span className="text-sm text-muted-foreground">of {pageCount || 1}</span>

        <select
          className="h-8 rounded-md border px-2 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map((s) => (
            <option key={s} value={s}>
              Show {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
