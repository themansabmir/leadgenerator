"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AddCategoryModal } from "@/components/categories/AddCategoryModal"
import { CategoriesTable } from "@/components/categories/CategoriesTable"
import { BulkImportButton } from "@/components/bulk-import"
import { queryKeys } from "@/lib/client/queryKeys"
import { toast } from "sonner"

export default function CategoriesPage() {
  const queryClient = useQueryClient()

  const handleBulkImportSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
    toast.success("Bulk import completed successfully")
  }

  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Categories</h1>
        <div className="flex items-center gap-2">
          <BulkImportButton 
            module="categories"
            variant="outline"
            onSuccess={handleBulkImportSuccess}
          />
          <AddCategoryModal />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <CategoriesTable />
      </div>
    </div>
  )
}
