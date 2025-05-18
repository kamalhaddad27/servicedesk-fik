"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ApiService } from "@/lib/api"
import { useTickets } from "@/hooks/use-ticket"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TicketCategories, TicketFormValues } from "@/types"

// Form schema
const ticketFormSchema = z.object({
  subject: z
    .string()
    .min(5, { message: "Subjek minimal 5 karakter" })
    .max(100, { message: "Subjek maksimal 100 karakter" }),
  description: z.string().min(10, { message: "Deskripsi minimal 10 karakter" }),
  category: z.string().min(1, { message: "Kategori harus dipilih" }),
  subcategory: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  priority: z.string().min(1, { message: "Prioritas harus dipilih" }),
})

export function TicketForm() {
  const router = useRouter()
  const { createTicket } = useTickets()
  const [files, setFiles] = useState<File[]>([])

  // Fetch ticket categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery<TicketCategories>({
    queryKey: ["settings", "ticket-categories"],
    queryFn: () => ApiService.getTicketCategories(),
  })

  // Form definition
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      subcategory: "",
      type: "",
      department: "",
      priority: "",
    },
  })

  // Selected category
  const selectedCategory = form.watch("category")
  const subcategories = selectedCategory && categories ? categories[selectedCategory]?.subcategories || [] : []

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Form submission
  const onSubmit = async (values: TicketFormValues) => {
    const formData = new FormData()

    // Add form values to FormData
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value)
      }
    })

    // Add files to FormData
    files.forEach((file) => {
      formData.append("attachments", file)
    })

    try {
      await createTicket.mutateAsync(formData)
      router.push("/tickets")
    } catch (error) {
      console.error("Error creating ticket:", error)
    }
  }

  if (isLoadingCategories) {
    return <LoadingSpinner />
  }

  if (isErrorCategories) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Gagal memuat kategori tiket. Silakan coba lagi nanti.</AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjek</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan subjek tiket" {...field} />
                </FormControl>
                <FormDescription>Berikan judul yang jelas dan singkat untuk tiket Anda.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan masalah atau permintaan Anda secara detail"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Berikan detail yang cukup untuk membantu kami memahami masalah Anda.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories &&
                        Object.keys(categories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {categories[category].name}
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
                    disabled={!selectedCategory || subcategories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih subkategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioritas</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Pilih prioritas sesuai dengan tingkat urgensi masalah Anda.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="akademik">Akademik</SelectItem>
                      <SelectItem value="keuangan">Keuangan</SelectItem>
                      <SelectItem value="kemahasiswaan">Kemahasiswaan</SelectItem>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="laboratorium">Laboratorium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Pilih departemen yang terkait dengan masalah Anda.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel>Lampiran (Opsional)</FormLabel>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, Word, Excel, Image (Maks. 10MB)</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">File yang dipilih:</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm bg-muted rounded-md">
                      <span className="truncate max-w-[250px]">{file.name}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? "Membuat Tiket..." : "Buat Tiket"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
