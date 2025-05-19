"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { useTickets } from "@/hooks/use-ticket"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox" // Import the proper Checkbox component
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { AlertCircle, Paperclip, Send, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MessageFormValues } from "@/types"

// Form schema
const messageFormSchema = z.object({
  message: z.string().min(1, { message: "Pesan tidak boleh kosong" }),
  isInternal: z.boolean().default(false),
})

interface TicketMessagesProps {
  ticketId: number
}

export function TicketMessages({ ticketId }: TicketMessagesProps) {
  const { userRole } = useAuth()
  const { useTicketMessages, addMessage } = useTickets()
  const [files, setFiles] = useState<File[]>([])

  // Fetch ticket messages
  const { data: messages = [], isLoading, isError, error } = useTicketMessages(ticketId)

  // Form definition
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
      isInternal: false,
    },
  })

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
  const onSubmit = async (values: MessageFormValues) => {
    const formData = new FormData()

    // Add form values to FormData
    formData.append("message", values.message)
    formData.append("isInternal", String(values.isInternal))

    // Add files to FormData
    files.forEach((file) => {
      formData.append("attachments", file)
    })

    try {
      await addMessage.mutateAsync({
        ticketId,
        formData,
      })
      form.reset()
      setFiles([])
    } catch (error) {
      console.error("Error adding message:", error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : "Gagal memuat pesan. Silakan coba lagi nanti."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-md bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Belum ada pesan untuk tiket ini.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="space-y-4"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-4 ${
                  message.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-muted"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {message.sender?.name.charAt(0) || "U"}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{message.sender?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt, "dd MMM yyyy, HH:mm")} ({formatRelativeTime(message.createdAt)})
                      </p>
                    </div>
                  </div>
                  {message.isInternal && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Internal</span>
                  )}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{message.message}</div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Lampiran:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center rounded-md bg-background px-2 py-1 text-xs hover:bg-accent"
                        >
                          <Paperclip className="mr-1 h-3 w-3" />
                          {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="border-t pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Tulis pesan Anda di sini..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(userRole === "dosen" || userRole === "admin") && (
              <FormField
                control={form.control}
                name="isInternal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        id="isInternal" 
                      />
                    </FormControl>
                    <label 
                      htmlFor="isInternal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Pesan internal (hanya dapat dilihat oleh staf)
                    </label>
                  </FormItem>
                )}
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("message-file-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Lampirkan File
                </Button>
                <input id="message-file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
              </div>

              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium">File yang dipilih:</p>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md bg-muted p-2 text-xs">
                        <span className="truncate max-w-[250px]">{file.name}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={addMessage.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {addMessage.isPending ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}