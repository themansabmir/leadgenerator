/**
 * Queries Table Component
 * Displays list of queries with status, progress, and actions
 */

"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueriesQuery, usePauseQueryMutation, useResumeQueryMutation, useResetQueryMutation } from "@/hooks/useQueries";
import { Loader2, Search, MoreVertical, Eye, Pause, Play, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDate(iso: string | null) {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: any; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    running: { variant: "default", label: "Running" },
    paused: { variant: "outline", label: "Paused" },
    completed: { variant: "success", label: "Completed" },
    failed: { variant: "destructive", label: "Failed" },
  };

  const config = variants[status] || { variant: "secondary", label: status };
  return (
    <Badge variant={config.variant as any} className="capitalize">
      {config.label}
    </Badge>
  );
}

export function QueriesTable() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const { data, isLoading, isFetching } = useQueriesQuery({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { mutate: pauseMut, isPending: isPausing } = usePauseQueryMutation();
  const { mutate: resumeMut, isPending: isResuming } = useResumeQueryMutation();
  const { mutate: resetMut, isPending: isResetting } = useResetQueryMutation();

  const handlePause = React.useCallback(
    (id: string) => {
      pauseMut(id, {
        onSuccess: () => toast.success("Query paused"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to pause"),
      });
    },
    [pauseMut]
  );

  const handleResume = React.useCallback(
    (id: string) => {
      resumeMut(id, {
        onSuccess: () => toast.success("Query resumed"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to resume"),
      });
    },
    [resumeMut]
  );

  const handleReset = React.useCallback(
    (id: string) => {
      if (!confirm("Are you sure? This will delete all results and reset progress.")) return;
      resetMut(id, {
        onSuccess: () => toast.success("Query reset successfully"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to reset"),
      });
    },
    [resetMut]
  );

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const totalPages = data?.pagination?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dork strings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dork</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("createdAt")}
                  className="-ml-3 h-8"
                >
                  Created
                  {sortBy === "createdAt" && (
                    <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((query: any) => (
                <TableRow key={query._id}>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">
                    {query.dorkString}
                  </TableCell>
                  <TableCell>{query.categoryId?.name || "N/A"}</TableCell>
                  <TableCell>{query.locationId?.name || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(query.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-[120px]">
                      <Progress value={query.progress || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {query.progress || 0}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{query.totalResultsFetched}</span>
                    <span className="text-muted-foreground text-xs">
                      {" "}/ {query.maxAllowedResults}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(query.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/queries/${query._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {(query.status === "running" || query.status === "pending") && (
                          <DropdownMenuItem onClick={() => handlePause(query._id)}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {query.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleResume(query._id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleReset(query._id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/api/queries/${query._id}/export`} download>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No queries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data?.data?.length || 0} of {data?.pagination?.total || 0} results
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
              setLimit(Number(e.target.value));
              setPage(1);
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
  );
}
