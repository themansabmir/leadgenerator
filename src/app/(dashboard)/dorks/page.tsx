"use client"

import * as React from "react"
import { AddDorkModal } from "@/components/dorks/AddDorkModal"
import { DorksTable } from "@/components/dorks/DorksTable"

export default function DorksPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Dorks</h1>
        <AddDorkModal />
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <DorksTable />
      </div>
    </div>
  )
}
