"use client"

import * as React from "react"
import { AddCategoryModal } from "@/components/categories/AddCategoryModal"
import { CategoriesTable } from "@/components/categories/CategoriesTable"

export default function CategoriesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Categories</h1>
        <AddCategoryModal />
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <CategoriesTable />
      </div>
    </div>
  )
}
