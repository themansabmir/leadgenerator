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
import { IDork } from "@/types"
import { useUpdateDorkMutation } from "@/hooks/useDorks"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const schema = z.object({
  query: z.string().min(1, { message: "Query is required" }),
})

type FormData = z.infer<typeof schema>

export function EditDorkModal({ dork }: { dork: IDork }) {
  const [open, setOpen] = React.useState(false)
  const { mutateAsync, isPending } = useUpdateDorkMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      query: dork.query,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ id: dork._id.toString(), payload: data })
      toast.success("Dork updated successfully")
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update dork")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
