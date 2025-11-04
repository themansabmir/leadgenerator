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

const schema = z.object({
  query: z.string().min(1, { message: "Query is required" }),
})

type FormData = z.infer<typeof schema>

async function createDork(data: FormData) {
  const { data: response } = await axios.post("/api/dorks", data)
  return response
}

export function AddDorkModal() {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: createDork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dorks"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Dork</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Dork</DialogTitle>
            <DialogDescription>
              Add a new dork to the database.
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
