/**
 * Query Run Form Component
 * Form to create and run a new query with dependent dropdowns
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocationsQuery } from "@/hooks/useLocations";
import { useCategoriesQuery } from "@/hooks/useCategories";
import { useDorksQuery } from "@/hooks/useDorks";
import { useCredentialsQuery } from "@/hooks/useCredentials";
import { useCreateQueryMutation } from "@/hooks/useQueries";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function QueryRunForm() {
  const router = useRouter();
  const [locationId, setLocationId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [dorkId, setDorkId] = React.useState("");
  const [credentialId, setCredentialId] = React.useState("");
  const [maxResults, setMaxResults] = React.useState("100");

  // Fetch options
  const { data: locationsData, isLoading: locationsLoading } = useLocationsQuery({ limit: 1000 });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({ limit: 1000 });
  const { data: dorksData, isLoading: dorksLoading } = useDorksQuery({ limit: 1000 });
  const { data: credentialsData, isLoading: credentialsLoading } = useCredentialsQuery({ limit: 1000 });

  const { mutate: createQuery, isPending } = useCreateQueryMutation();

  // Get selected dork string for preview
  const selectedDork = React.useMemo(() => {
    if (!dorkId || !dorksData?.data) return null;
    return dorksData.data.find((d: any) => d._id?.toString() === dorkId || d.id === dorkId);
  }, [dorkId, dorksData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationId || !categoryId || !dorkId || !credentialId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const maxAllowedResults = parseInt(maxResults, 10);
    if (isNaN(maxAllowedResults) || maxAllowedResults < 1 || maxAllowedResults > 1000) {
      toast.error("Max results must be between 1 and 1000");
      return;
    }

    createQuery(
      {
        locationId,
        categoryId,
        dorkId,
        credentialId,
        maxAllowedResults
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Query created successfully!");
          router.push(`/queries/${data.queryId}`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create query");
        }
      }
    );
  };

  const isLoading = locationsLoading || categoriesLoading || dorksLoading || credentialsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Query</CardTitle>
        <CardDescription>
          Select location, category, dork, and credentials to start scraping search results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select value={locationId} onValueChange={setLocationId} disabled={isLoading}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationsData?.data?.map((location: any) => (
                  <SelectItem key={location._id?.toString() || location.id} value={location._id?.toString() || location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.data?.map((category: any) => (
                  <SelectItem key={category._id?.toString() || category.id} value={category._id?.toString() || category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dork Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="dork">Dork Query *</Label>
            <Select value={dorkId} onValueChange={setDorkId} disabled={isLoading}>
              <SelectTrigger id="dork">
                <SelectValue placeholder="Select dork" />
              </SelectTrigger>
              <SelectContent>
                {dorksData?.data?.map((dork: any) => (
                  <SelectItem key={dork._id?.toString() || dork.id} value={dork._id?.toString() || dork.id}>
                    <span className="font-mono text-sm truncate max-w-[400px] block">
                      {dork.query}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDork && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Dork String Preview:</p>
                <code className="text-sm font-mono break-all">{selectedDork.query}</code>
              </div>
            )}
          </div>

          {/* Credential Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="credential">API Credential *</Label>
            <Select value={credentialId} onValueChange={setCredentialId} disabled={isLoading}>
              <SelectTrigger id="credential">
                <SelectValue placeholder="Select credential" />
              </SelectTrigger>
              <SelectContent>
                {credentialsData?.data?.map((credential: any) => (
                  <SelectItem key={credential._id?.toString() || credential.id} value={credential._id?.toString() || credential.id}>
                    {credential.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Results Input */}
          <div className="space-y-2">
            <Label htmlFor="maxResults">Max Results</Label>
            <Input
              id="maxResults"
              type="number"
              min="1"
              max="1000"
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of results to fetch (1-1000). Default: 100
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isPending || isLoading} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Query...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Create & Run Query
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
