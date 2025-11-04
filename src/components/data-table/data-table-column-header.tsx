"use client"

import { ArrowUpDown } from "lucide-react"
import { flexRender, type Column } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: Props<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-sm font-medium", className)}>{flexRender(title, {})}</div>
  }

  const isAsc = column.getIsSorted() === "asc"
  const isDesc = column.getIsSorted() === "desc"

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(isAsc)}
    >
      <span className="mr-2">{title}</span>
      <ArrowUpDown className={cn("h-4 w-4", (isAsc || isDesc) && "text-foreground")} />
    </Button>
  )
}
