"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { IDork } from "@/types"
import { EditDorkModal } from "./EditDorkModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

async function fetchDorks() {
  const { data } = await axios.get("/api/dorks")
  return data.dorks
}

async function deleteDork(id: string) {
  await axios.delete(`/api/dorks/${id}`)
}

export function DorksTable() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ["dorks"],
    queryFn: fetchDorks,
  })

  const mutation = useMutation({
    mutationFn: deleteDork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dorks"] })
    },
  })

  const handleDelete = (id: string) => {
    mutation.mutate(id)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading dorks</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Query</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((dork: IDork) => (
          <TableRow key={dork._id}>
            <TableCell>{dork.query}</TableCell>
            <TableCell>
              <EditDorkModal dork={dork} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the dork.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(dork._id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
