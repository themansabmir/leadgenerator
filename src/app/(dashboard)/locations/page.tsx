"use client"

import * as React from "react"
import { AddLocationModal } from "@/components/locations/AddLocationModal"
import { LocationsTable } from "@/components/locations/LocationsTable"

export default function LocationsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Locations</h1>
        <AddLocationModal />
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <LocationsTable />
      </div>
    </div>
  )
}
