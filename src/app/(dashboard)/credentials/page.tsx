"use client"

import * as React from "react"
import { AddCredentialModal } from "@/components/credentials/AddCredentialModal"
import { CredentialsTable } from "@/components/credentials/CredentialsTable"

export default function CredentialsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 md:p-6">
        <h1 className="text-xl font-semibold">Credentials</h1>
        <AddCredentialModal />
      </div>
      <div className="bg-white rounded-lg p-4 md:p-6">
        <CredentialsTable />
      </div>
    </div>
  )
}
