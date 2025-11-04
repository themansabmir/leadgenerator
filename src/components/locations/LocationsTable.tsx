"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ILocation } from "@/types"
import { EditLocationModal } from "./EditLocationModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLocationsQuery, useDeleteLocationMutation } from "@/hooks/useLocations"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

export function LocationsTable() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [sortField, setSortField] = React.useState("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = React.useState("")
  const debouncedSearch = useDebouncedValue(searchTerm, 400)

  const { data, isLoading, isFetching } = useLocationsQuery({
    page,
    limit,
    sortField,
    sortOrder,
    search: debouncedSearch,
  })

  const { mutate: deleteMut, isPending: isDeleting } = useDeleteLocationMutation()

  const handleDelete = React.useCallback(
    (id: string) => {
      deleteMut(id, {
        onSuccess: () => {
          toast.success("Location deleted successfully")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete location")
        },
      })
    },
    [deleteMut]
  )

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
      </div>

      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="-ml-3 h-8"
                >
                  Name
                  {sortField === "name" && (
                    <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("slug")}
                  className="-ml-3 h-8"
                >
                  Slug
                  {sortField === "slug" && (
                    <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((location) => (
                <TableRow key={location._id.toString()}>
                  <TableCell className="truncate max-w-[300px]">{location.name}</TableCell>
                  <TableCell className="text-muted-foreground">{location.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditLocationModal location={location} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete location?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is irreversible and will permanently remove the location.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(location._id.toString())}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No locations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data?.data.length || 0} of {data?.total || 0} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || isFetching}
          >
            Next
          </Button>
          <select
            className="h-8 rounded-md border px-2 text-sm"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
