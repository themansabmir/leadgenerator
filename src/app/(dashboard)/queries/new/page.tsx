/**
 * New Query Page
 * Page for creating a new query
 */

"use client";

import * as React from "react";
import { QueryRunForm } from "@/components/queries/QueryRunForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewQueryPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/queries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queries
          </Button>
        </Link>
      </div>
      <QueryRunForm />
    </div>
  );
}
