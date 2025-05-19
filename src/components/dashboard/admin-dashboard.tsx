"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { PageTitle } from "../ui/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Progress } from "@/components/ui/progress"
import { formatDate, getTicketStatusColor, getTicketPriorityColor, getSLAStatusColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Clock, CheckCircle, AlertCircle, BarChart3, FileText, AlertTriangle, Users, Settings } from 'lucide-react'
import { Ticket, TicketStats, TicketType } from "@/types"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")

  // Fetch ticket stats
  const {
    data: ticketStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery<TicketStats>({
    queryKey: ["ticketStats"],
    queryFn: () => ApiService.getTicketStats(),
  })

  // Fetch all tickets
  const {
    data: allTickets = [],
    isLoading: isLoadingTickets,
    isError: isErrorTickets,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", "all"],
    queryFn: () => ApiService.getAllTickets(),
  })

  // Fetch assigned tickets
  const {
    data: assignedTickets = [],
    isLoading: isLoadingAssigned,
    isError: isErrorAssigned,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", "assigned"],
    queryFn: () => ApiService.getAssignedTickets(),
  })

  // Filter tickets based on active tab
  const displayedTickets = activeTab === "all" ? allTickets : activeTab === "assigned" ? assignedTickets : allTickets

  // Count tickets by SLA status
  const onTimeCount = allTickets.filter((ticket) => ticket.slaStatus === "on-time").length
  const atRiskCount = allTickets.filter((ticket) => ticket.slaStatus === "at-risk").length
  const breachedCount = allTickets.filter((ticket) => ticket.slaStatus === "breached").length

  const isLoading = isLoadingStats || isLoadingTickets || isLoadingAssigned
  const isError = isErrorStats || isErrorTickets || isErrorAssigned

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">Terjadi kesalahan saat memuat data dashboard.</p>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <PageTitle
        title={`Selamat datang, ${user?.name}!`}
        description="Pantau dan kelola semua tiket dan pengguna dalam sistem."
      />

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total tiket dalam sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Aktif</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketStats?.byStatus
                .filter((s) => ["pending", "disposisi", "in-progress"].includes(s.status))
                .reduce((acc, curr) => acc + curr.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tiket yang sedang aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketStats?.byStatus.find((s) => s.status === "completed")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tiket yang telah diselesaikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Berisiko</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCount + breachedCount}</div>
            <p className="text-xs text-muted-foreground">Tiket yang berisiko atau melewati SLA</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status Tiket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketStats?.byStatus.map((statusItem) => (
                <div key={statusItem.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize">{statusItem.status.replace("-", " ")}</span>
                    <span className="text-xs font-medium">{statusItem.count}</span>
                  </div>
                  <Progress
                    value={(statusItem.count / ticketStats.total) * 100}
                    className={`h-2 ${getTicketStatusColor(statusItem.status)}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tiket berdasarkan Prioritas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketStats?.byPriority.map((priorityItem) => (
                <div key={priorityItem.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize">{priorityItem.priority}</span>
                    <span className="text-xs font-medium">{priorityItem.count}</span>
                  </div>
                  <Progress
                    value={(priorityItem.count / ticketStats.total) * 100}
                    className={`h-2 ${getTicketPriorityColor(priorityItem.priority)}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/tickets/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Tiket Baru
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Pengguna
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan Sistem
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Lihat Laporan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tiket Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {allTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Tidak ada tiket dalam sistem</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">
                        {ticket.subject}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{ticket.ticketNumber}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>
                          {ticket.creator?.name ? `Dari: ${ticket.creator.name}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                      {ticket.slaStatus && <Badge className={getSLAStatusColor(ticket.slaStatus)}>{ticket.slaStatus}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/tickets">Lihat Semua Tiket</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tiket</h2>
          <Button asChild>
            <Link href="/tickets/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Tiket Baru
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="all">Semua Tiket</TabsTrigger>
            <TabsTrigger value="assigned">Ditugaskan</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {displayedTickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {activeTab === "all"
                      ? "Tidak ada tiket dalam sistem saat ini."
                      : "Tidak ada tiket yang ditugaskan kepada Anda saat ini."}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/tickets/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Buat Tiket Baru
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayedTickets.slice(0, 5).map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                            <CardTitle className="text-base">{ticket.subject}</CardTitle>
                          </Link>
                          <div className="flex gap-2">
                            <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                            <Badge className={getTicketPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            {ticket.slaStatus && (
                              <Badge className={getSLAStatusColor(ticket.slaStatus)}>{ticket.slaStatus}</Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          Tiket #{ticket.ticketNumber} • {ticket.category}
                          {ticket.subcategory && ` > ${ticket.subcategory}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.description}</p>
                        {ticket.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span>{ticket.progress}%</span>
                            </div>
                            <Progress value={ticket.progress} className="h-2 mt-1" />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-0">
                        <p className="text-xs text-muted-foreground">
                          {ticket.creator?.name ? `Dari: ${ticket.creator.name} • ` : ""}
                          {formatDate(ticket.createdAt, "dd MMM yyyy")}
                        </p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/tickets/${ticket.id}`}>Lihat Detail</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
                {displayedTickets.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href={activeTab === "all" ? "/tickets" : "/tickets/assigned"}>
                        Lihat Semua Tiket ({displayedTickets.length})
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
