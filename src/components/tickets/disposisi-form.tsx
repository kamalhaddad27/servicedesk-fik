"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTickets } from "@/hooks/use-ticket"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Ticket, User } from "@/types"

// Form schema
const disposisiFormSchema = z.object({
  toUserId: z.string().min(1, { message: "Penerima harus dipilih" }),
  reason: z.string().min(5, { message: "Alasan minimal 5 karakter" }),
  notes: z.string().optional(),
  updateProgress: z.string().optional(),
  actionType: z.enum(["forward", "escalate", "return"], {
    required_error: "Tipe tindakan harus dipilih",
  }),
})

interface DisposisiFormProps {
  ticket: Ticket
  availableDosen: User[]
  onClose: () => void
}

export function DisposisiForm({ ticket, availableDosen, onClose }: DisposisiFormProps) {
  const { disposisiTicket } = useTickets()

  // Form definition
  const form = useForm<z.infer<typeof disposisiFormSchema>>({
    resolver: zodResolver(disposisiFormSchema),
    defaultValues: {
      toUserId: "",
      reason: "",
      notes: "",
      updateProgress: ticket.progress ? String(ticket.progress) : "0",
      actionType: "forward",
    },
  })

  // Form submission
  const onSubmit = async (values: z.infer<typeof disposisiFormSchema>) => {
    try {
      await disposisiTicket.mutateAsync({
        ticketId: ticket.id,
        toUserId: Number.parseInt(values.toUserId),
        reason: values.reason,
        notes: values.notes,
        updateProgress: values.updateProgress ? Number.parseInt(values.updateProgress) : undefined,
        actionType: values.actionType,
      })
      onClose()
    } catch (error) {
      console.error("Error disposisi ticket:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Disposisi Tiket</DialogTitle>
          <DialogDescription>Teruskan tiket ini ke pengguna lain untuk ditindaklanjuti.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="actionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Tindakan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe tindakan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="forward">Forward (Teruskan)</SelectItem>
                      <SelectItem value="escalate">Escalate (Eskalasi)</SelectItem>
                      <SelectItem value="return">Return (Kembalikan)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Pilih tipe tindakan yang akan dilakukan.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teruskan Kepada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih penerima" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDosen.map((dosen) => (
                        <SelectItem key={dosen.id} value={String(dosen.id)}>
                          {dosen.name} - {dosen.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Berikan alasan untuk disposisi ini" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Berikan catatan tambahan jika diperlukan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="updateProgress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Progress (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>Perbarui progress penyelesaian tiket (0-100%).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={disposisiTicket.isPending}>
                {disposisiTicket.isPending ? "Memproses..." : "Disposisi Tiket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
''