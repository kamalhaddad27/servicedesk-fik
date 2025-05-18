"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTickets } from "@/hooks/use-ticket"
import { useUsers } from "@/hooks/use-users"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TicketMessages } from "./ticket-messages"
import { DisposisiForm } from "./disposisi-form"
import { formatDate, getTicketStatusColor, getTicketPriorityColor, getSLAStatusColor } from "@/lib/utils"
import { AlertCircle, ArrowLeft, Clock, FileText, MessageSquare, MoreHorizontal, Send, User, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Ticket } from "@/types"

interface TicketDetailProps {
  ticketId: number
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter()
  const { userRole } = useAuth()
  const { useTicketDetail, updateTicket, quickResolveTicket } = useTickets()
  const { useAvailableDosen } = useUsers()
  const [activeTab, setActiveTab] = useState("details")
  const [isDisposisiOpen, setIsDisposisiOpen] = useState(false)
  const [quickResolveOpen, setQuickResolveOpen] = useState(false)
  const [solution, setSolution] = useState("")

  // Fetch ticket details
  const {
    data: ticket,
    isLoading,
    isError,
    error,
  } = useTicketDetail(ticketId)

  // Fetch available dosen for disposisi
  const { data: availableDosen = [] } = useAvailableDosen(ticket?.department)

  // Check if user can edit the ticket
  const canEdit = userRole === "admin" || (userRole === "dosen" && ticket?.assignedTo === Number(userRole))

  // Check if user can disposisi the ticket
  const canDisposisi =
    (userRole === "dosen" || userRole === "admin") &&
    ["pending", "disposisi", "in-progress"].includes(ticket?.status || "") &&
    ticket?.assignedTo === Number(userRole)

  // Check if user can resolve the ticket
  const canResolve =
    (userRole === "dosen" || userRole === "admin") &&
    ["pending", "disposisi", "in-progress"].includes(ticket?.status || "") &&
    ticket?.assignedTo === Number(userRole)

  // Handle quick resolve
  const handleQuickResolve = async () => {
    if (!solution.trim()) return

    try {
      await quickResolveTicket.mutateAsync({
        ticketId,
        solution,
      })
      setQuickResolveOpen(false)
      setSolution("")
    } catch (error) {
      console.error("Error resolving ticket:", error)
    }
  }

  // Handle status change
  const handleStatusChange = async (status: string) => {
    try {
      await updateTicket.mutateAsync({
        id: ticketId,
        data: { status },
      })
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !ticket) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : "Gagal memuat detail tiket. Silakan coba lagi nanti."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center gap-2">
          {canDisposisi && (
            <Button onClick={() => setIsDisposisiOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Disposisi
            </Button>
          )}

          {canResolve && (
            <Dialog open={quickResolveOpen} onOpenChange={setQuickResolveOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Selesaikan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selesaikan Tiket</DialogTitle>
                  <DialogDescription>
                    Berikan solusi atau catatan penyelesaian untuk tiket ini.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Masukkan solusi atau catatan penyelesaian..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="min-h-32"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setQuickResolveOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleQuickResolve} disabled={quickResolveTicket.isPending}>
                    {quickResolveTicket.isPending ? "Menyelesaikan..." : "Selesaikan Tiket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ticket.status !== "in-progress" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>
                    Tandai Sedang Diproses
                  </DropdownMenuItem>
                )}
                {ticket.status !== "completed" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                    Tandai Selesai
                  </DropdownMenuItem>
                )}
                {ticket.status !== "cancelled" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
                    Batalkan Tiket
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                  <CardDescription>
                    Tiket #{ticket.ticketNumber} • {formatDate(ticket.createdAt, "dd MMMM yyyy, HH:mm")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <Badge className={getTicketPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  {ticket.slaStatus && (
                    <Badge className={getSLAStatusColor(ticket.slaStatus)}>{ticket.slaStatus}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="details">Detail</TabsTrigger>
                  <TabsTrigger value="messages">Pesan</TabsTrigger>
                  <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Deskripsi</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{ticket.description}</p>
                  </div>

                  {ticket.progress > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">Progress</h3>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Status penyelesaian</span>
                          <span>{ticket.progress}%</span>
                        </div>
                        <Progress value={ticket.progress} className="h-2 mt-1" />
                      </div>
                    </div>
                  )}

                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">Lampiran</h3>
                      <div className="mt-2 space-y-2">
                        {ticket.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between rounded-md border p-2 text-sm"
                          >
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{attachment.fileName}</span>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="messages">
                  <TicketMessages ticketId={ticketId} />
                </TabsContent>
                <TabsContent value="history">
                  <div className="mt-4">
                    <h3 className="text-sm font-medium">Riwayat Disposisi</h3>
                    {/* Disposisi history will be implemented here */}
                    <p className="mt-2 text-sm text-muted-foreground">
                      Riwayat disposisi akan ditampilkan di sini.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Informasi Tiket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Kategori</h3>
                <p className="mt-1 text-sm">
                  {ticket.category}
                  {ticket.subcategory && ` > ${ticket.subcategory}`}
                </p>
              </div>

              {ticket.department && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">Departemen</h3>
                  <p className="mt-1 text-sm">{ticket.department}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Dibuat oleh</h3>
                <div className="mt-1 flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm">{ticket.creator?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{ticket.creator?.email || ""}</p>
                  </div>
                </div>
              </div>

              {ticket.handler && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">Ditangani oleh</h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="ml-2">
                      <p className="text-sm">{ticket.handler.name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.handler.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {ticket.slaDeadline && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">Tenggat SLA</h3>
                  <div className="mt-1 flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(ticket.slaDeadline, "dd MMM yyyy, HH:mm")}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Aktivitas</h3>
                <div className="mt-1 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Dibuat pada</span>
                    <span>{formatDate(ticket.createdAt, "dd MMM yyyy")}</span>
                  </div>
                  {ticket.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span>Diperbarui pada</span>
                      <span>{formatDate(ticket.updatedAt, "dd MMM yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  <span>3 pesan</span>
                </div>
                {ticket.status === "completed" ? (
                  <Badge className="bg-green-100 text-green-800">Selesai</Badge>
                ) : ticket.status === "cancelled" ? (
                  <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Dalam Proses</Badge>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {isDisposisiOpen && (
        <DisposisiForm
          ticket={ticket}
          availableDosen={availableDosen}
          onClose={() => setIsDisposisiOpen(false)}
        />
      )}
    </motion.div>
  )
}
