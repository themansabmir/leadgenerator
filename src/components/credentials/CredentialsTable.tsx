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
import { useCredentialsQuery, useDeleteCredentialMutation } from "@/hooks/useCredentials"
import { type CredentialDTO } from "@/types/credentials"
import { DataTableColumnHeader } from "@/components/data-table" 
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function CredentialsTable() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [sortField, setSortField] = React.useState("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = React.useState("")
  const debouncedSearch = useDebouncedValue(searchTerm, 400)

  const { data, isLoading, isFetching } = useCredentialsQuery({
    page,
    limit,
    sortField,
    sortOrder,
    search: debouncedSearch,
  })

  const { mutate: deleteMut, isPending: isDeleting } = useDeleteCredentialMutation()

  const onDelete = React.useCallback(
    (id: string) => {
      deleteMut(id, {
        onSuccess: () => {
          toast.success("Credential deleted successfully")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete credential")
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
            placeholder="Search credentials..."
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
                  onClick={() => handleSort("label")}
                  className="-ml-3 h-8"
                >
                  Label
                  {sortField === "label" && (
                    <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("createdAt")}
                  className="-ml-3 h-8"
                >
                  Created
                  {sortField === "createdAt" && (
                    <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell className="truncate max-w-[320px]">{credential.label}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(credential.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete credential?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action is irreversible and will permanently remove the credential.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(credential.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No credentials found
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
