/**
 * Queries List Page
 * Main page for viewing and managing queries
 */

"use client";

import * as React from "react";
import { QueriesTable } from "@/components/queries/QueriesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function QueriesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <div>
          <h1 className="text-xl font-semibold">Queries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your search queries and view results
          </p>
        </div>
        <Link href="/queries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Query
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <QueriesTable />
      </div>
    </div>
  );
}
