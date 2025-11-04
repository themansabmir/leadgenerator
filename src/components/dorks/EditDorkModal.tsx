"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { IDork } from "@/types"

const schema = z.object({
  query: z.string().min(1, { message: "Query is required" }),
})

type FormData = z.infer<typeof schema>

async function updateDork({ id, data }: { id: string, data: FormData }) {
  const { data: response } = await axios.put(`/api/dorks/${id}`, data)
  return response
}

export function EditDorkModal({ dork }: { dork: IDork }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      query: dork.query,
    },
  })

  const mutation = useMutation({
    mutationFn: updateDork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dorks"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({ id: dork._id, data })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Dork</DialogTitle>
            <DialogDescription>
              Edit the dork details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="query" className="text-right">
                Query
              </Label>
              <Input id="query" {...register("query")} className="col-span-3" />
              {errors.query && <p className="col-span-4 text-red-500">{errors.query.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
