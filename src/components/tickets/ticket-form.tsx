"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSettings } from "@/hooks/use-settings"
import { useTickets } from "@/hooks/use-ticket"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const ticketFormSchema = z.object({
  subject: z.string().min(5, {
    message: "Judul tiket harus minimal 5 karakter",
  }),
  description: z.string().min(10, {
    message: "Deskripsi tiket harus minimal 10 karakter",
  }),
  category: z.string().min(1, {
    message: "Kategori harus dipilih",
  }),
  subcategory: z.string().optional(),
  type: z.string({
    required_error: "Tipe tiket harus dipilih",
  }),
  department: z.string().min(1, {
    message: "Departemen harus dipilih",
  }),
  priority: z.string().min(1, {
    message: "Prioritas harus dipilih",
  }),
})

export function TicketForm() {
  const { categories } = useSettings()
  const { createTicket } = useTickets()
  const [attachments, setAttachments] = useState<File[]>([])
  const [subcategoryList, setSubcategoryList] = useState<string[]>([])

  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      subcategory: "",
      type: "permintaan", // Set a default value for type
      department: "",
      priority: "medium",
    },
  })

  // Watch for category changes to update subcategories
  const selectedCategory = form.watch("category")
  useState(() => {
    if (selectedCategory && categories?.[selectedCategory]?.subcategories) {
      setSubcategoryList(categories[selectedCategory].subcategories)
    } else {
      setSubcategoryList([])
    }
  })

  const onSubmit = async (values: z.infer<typeof ticketFormSchema>) => {
    try {
      const formData = new FormData()

      // Add form fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value)
        }
      })

      // Add attachments to FormData
      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      // Submit the form
      await createTicket.mutateAsync(formData)

      // Reset form
      form.reset()
      setAttachments([])
    } catch (error) {
      console.error("Error creating ticket:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {createTicket.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createTicket.error?.message || "Terjadi kesalahan saat membuat tiket"}
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan judul tiket" {...field} />
                </FormControl>
                <FormDescription>
                  Masukkan judul singkat dan jelas untuk tiket Anda
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Update subcategories when category changes
                      if (categories?.[value]?.subcategories) {
                        setSubcategoryList(categories[value].subcategories)
                        form.setValue("subcategory", "") // Reset subcategory
                      } else {
                        setSubcategoryList([])
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {categories &&
                        Object.entries(categories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
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
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subkategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={subcategoryList.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          subcategoryList.length === 0
                            ? "Pilih kategori terlebih dahulu"
                            : "Pilih subkategori"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {subcategoryList.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Tiket</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe tiket" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="pengajuan">Pengajuan</SelectItem>
                      <SelectItem value="laporan">Laporan</SelectItem>
                      <SelectItem value="permintaan">Permintaan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="Akademik">Akademik</SelectItem>
                      <SelectItem value="Fasilitas">Fasilitas</SelectItem>
                      <SelectItem value="Keuangan">Keuangan</SelectItem>
                      <SelectItem value="Kemahasiswaan">Kemahasiswaan</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Umum">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioritas</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="low">Rendah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="high">Tinggi</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan masalah/permintaan Anda secara detail"
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Berikan informasi selengkap mungkin tentang tiket ini
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Lampiran</FormLabel>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" />
                <span>Pilih File</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="text-sm font-medium">Lampiran</div>
                  <ul className="mt-2 space-y-2">
                    {attachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Hapus
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <Button type="submit" disabled={createTicket.isPending} className="w-full">
            {createTicket.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Tiket...
              </>
            ) : (
              "Buat Tiket"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}