"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AddLocationModal } from "@/components/locations/AddLocationModal"
import { LocationsTable } from "@/components/locations/LocationsTable"
import { BulkImportButton } from "@/components/bulk-import"
import { queryKeys } from "@/lib/client/queryKeys"
import { toast } from "sonner"

export default function LocationsPage() {
  const queryClient = useQueryClient()

  const handleBulkImportSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.locations.all() })
    toast.success("Bulk import completed successfully")
  }

  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Locations</h1>
        <div className="flex items-center gap-2">
          <BulkImportButton 
            module="locations"
            variant="outline"
            onSuccess={handleBulkImportSuccess}
          />
          <AddLocationModal />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <LocationsTable />
      </div>
    </div>
  )
}
