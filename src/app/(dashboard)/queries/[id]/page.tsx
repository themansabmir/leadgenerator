/**
 * Query Details Page
 * Displays query metadata, status, and results
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useQueryByIdQuery,
  useQueryResultsQuery,
  useExecuteQueryMutation,
  usePauseQueryMutation,
  useResumeQueryMutation,
  useResetQueryMutation,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
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

export default function QueryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryId = params.id as string;

  const [resultsPage, setResultsPage] = React.useState(1);
  const [resultsLimit, setResultsLimit] = React.useState(50);

  const { data: query, isLoading: queryLoading } = useQueryByIdQuery(queryId);
  const { data: results, isLoading: resultsLoading } = useQueryResultsQuery(
    queryId,
    { page: resultsPage, limit: resultsLimit },
    !!query
  );

  const { mutate: executeMut, isPending: isExecuting } = useExecuteQueryMutation();
  const { mutate: pauseMut, isPending: isPausing } = usePauseQueryMutation();
  const { mutate: resumeMut, isPending: isResuming } = useResumeQueryMutation();
  const { mutate: resetMut, isPending: isResetting } = useResetQueryMutation();

  const handleExecute = () => {
    executeMut(queryId, {
      onSuccess: () => toast.success("Query page executed"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Execution failed"),
    });
  };

  const handlePause = () => {
    pauseMut(queryId, {
      onSuccess: () => toast.success("Query paused"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to pause"),
    });
  };

  const handleResume = () => {
    resumeMut(queryId, {
      onSuccess: () => toast.success("Query resumed"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to resume"),
    });
  };

  const handleReset = () => {
    if (!confirm("Are you sure? This will delete all results and reset progress.")) return;
    resetMut(queryId, {
      onSuccess: () => {
        toast.success("Query reset successfully");
        setResultsPage(1);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to reset"),
    });
  };

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Query not found</p>
        <Link href="/queries">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queries
          </Button>
        </Link>
      </div>
    );
  }

  const totalResultsPages = results?.pagination?.totalPages || 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/queries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Query Details</CardTitle>
              <CardDescription className="font-mono text-xs">
                {query.dorkString}
              </CardDescription>
            </div>
            {getStatusBadge(query.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{query.locationId?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{query.categoryId?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credential</p>
              <p className="font-medium">{query.credentialId?.label || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium text-sm">{formatDate(query.createdAt)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {query.totalResultsFetched} / {query.maxAllowedResults} results ({query.progress || 0}%)
              </span>
            </div>
            <Progress value={query.progress || 0} className="h-3" />
          </div>

          {/* Error Message */}
          {query.errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Error:</p>
              <p className="text-sm text-destructive/80 mt-1">{query.errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {query.canFetchMore && (query.status === "pending" || query.status === "running") && (
              <Button onClick={handleExecute} disabled={isExecuting} size="sm">
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Page
                  </>
                )}
              </Button>
            )}
            {(query.status === "running" || query.status === "pending") && (
              <Button onClick={handlePause} disabled={isPausing} variant="outline" size="sm">
                {isPausing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="mr-2 h-4 w-4" />
                )}
                Pause
              </Button>
            )}
            {query.status === "paused" && (
              <Button onClick={handleResume} disabled={isResuming} variant="outline" size="sm">
                {isResuming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Resume
              </Button>
            )}
            <Button onClick={handleReset} disabled={isResetting} variant="outline" size="sm">
              {isResetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Reset
            </Button>
            <a href={`/api/queries/${queryId}/export`} download>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {results?.pagination?.total || 0} results found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Snippet</TableHead>
                    <TableHead>Fetched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results?.data && results.data.length > 0 ? (
                    results.data.map((result: any) => (
                      <TableRow key={result._id}>
                        <TableCell className="font-medium">{result.rank || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate font-medium">{result.title}</p>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{result.displayLink || result.url}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.snippet}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(result.fetchedAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No results yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Results Pagination */}
              {results && results.data.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {results.data.length} of {results.pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                      disabled={resultsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {resultsPage} of {totalResultsPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResultsPage((p) => p + 1)}
                      disabled={resultsPage >= totalResultsPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
